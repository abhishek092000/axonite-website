import pymysql

# Default expiry (in minutes) for a password reset OTP
OTP_EXPIRY_MINUTES = 10


def get_connection(db_config):
    return pymysql.connect(**db_config)


def dict_rows(cursor, rows):
    """Normalizes cursor results to a list of dicts.

    Some MySQL drivers ignore the dict cursorclass, so every admin
    query goes through here to stay driver agnostic.
    """
    rows = rows or []
    if rows and isinstance(rows[0], (tuple, list)):
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    return rows


ADMIN_DETAILS_DDL = """
    CREATE TABLE IF NOT EXISTS admin_details (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        admin_email VARCHAR(100) NOT NULL UNIQUE,
        admin_username VARCHAR(50) NOT NULL UNIQUE,
        admin_password VARCHAR(255) NOT NULL,
        role VARCHAR(16) NOT NULL DEFAULT 'temporary',
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
"""

# admin_password is widened because the stored password may be either a
# werkzeug hash or a 64-char sha256 hash (see auth.py).
WIDEN_PASSWORD_DDL = (
    "ALTER TABLE admin_details MODIFY admin_password VARCHAR(255) NOT NULL"
)

ADMIN_OTP_DDL = """
    CREATE TABLE IF NOT EXISTS admin_otp (
        otp_id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        otp_code VARCHAR(128) NOT NULL,
        purpose VARCHAR(32) NOT NULL DEFAULT 'password_reset',
        is_used TINYINT(1) NOT NULL DEFAULT 0,
        attempts INT NOT NULL DEFAULT 0,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_otp_lookup (admin_id, purpose, is_used),
        CONSTRAINT fk_admin_otp_admin
            FOREIGN KEY (admin_id) REFERENCES admin_details (admin_id)
            ON DELETE CASCADE
    )
"""


def ensure_admin_tables(conn):
    """Creates/updates the tables backing admin auth. Safe to run repeatedly."""
    with conn.cursor() as cursor:
        # A second app instance may create the table concurrently, so creation
        # errors are ignored and verified by the follow-up checks.
        for statement in (ADMIN_DETAILS_DDL, ADMIN_OTP_DDL):
            try:
                cursor.execute(statement)
            except pymysql.err.OperationalError:
                pass

        # Pre-existing deployments have an admin_details table without
        # created_date, and CREATE TABLE IF NOT EXISTS will not add it.
        cursor.execute("SHOW COLUMNS FROM admin_details LIKE 'created_date'")
        if not cursor.fetchall():
            cursor.execute(
                "ALTER TABLE admin_details "
                "ADD COLUMN created_date DATETIME DEFAULT CURRENT_TIMESTAMP"
            )

        # Same for the role column used to tell the main admin apart.
        cursor.execute("SHOW COLUMNS FROM admin_details LIKE 'role'")
        if not cursor.fetchall():
            cursor.execute(
                "ALTER TABLE admin_details "
                "ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'temporary'"
            )

        # Password column must fit werkzeug/sha256 hashes. Guarded by an
        # information_schema lookup so the ALTER only runs when needed.
        cursor.execute(
            """
            SELECT CHARACTER_MAXIMUM_LENGTH AS len
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'admin_details'
              AND COLUMN_NAME = 'admin_password'
            """
        )
        row = cursor.fetchall()
        if row and isinstance(row[0], dict):
            current_len = row[0].get("len")
        else:
            current_len = row[0][0] if row else None
        if current_len is not None and int(current_len) < 255:
            try:
                cursor.execute(WIDEN_PASSWORD_DDL)
            except pymysql.err.OperationalError:
                pass

        # The main admin is the earliest account — the pre-existing one in
        # legacy databases. Runs once: afterwards a 'main' row already exists.
        cursor.execute("SELECT COUNT(*) AS total FROM admin_details WHERE role = 'main'")
        row = cursor.fetchall()
        main_count = row[0].get("total") if row and isinstance(row[0], dict) else (row[0][0] if row else 0)
        if not main_count:
            cursor.execute(
                "UPDATE admin_details SET role = 'main' WHERE admin_id = "
                "(SELECT min_id FROM (SELECT MIN(admin_id) AS min_id FROM admin_details) AS first_admin)"
            )

    conn.commit()
