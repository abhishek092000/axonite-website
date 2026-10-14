import datetime
import hashlib
import os
import secrets
import smtplib
import traceback

import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from src.db import OTP_EXPIRY_MINUTES, dict_rows, ensure_admin_tables, get_connection
from src.email_utils import send_otp_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

JWT_SECRET = os.getenv("JWT_SECRET_KEY") or os.getenv(
    "FLASK_SECRET_KEY", "your-very-secure-jwt-secret-key-change-this"
)
JWT_EXPIRATION_HOURS = 24

MAX_OTP_ATTEMPTS = 5
MIN_PASSWORD_LENGTH = 8

MAIN_ROLE = "main"
TEMPORARY_ROLE = "temporary"

MAIN_ADMIN_ONLY = "Only the main admin can manage admin accounts."


# --- Password helpers ---

def hash_password(password):
    return generate_password_hash(password)


def is_sha256_hash(value):
    return (
        isinstance(value, str)
        and len(value) == 64
        and all(c in "0123456789abcdefABCDEF" for c in value)
    )


def verify_password(stored, candidate):
    """Checks a candidate password against what is stored in the database.

    Supports werkzeug hashes, legacy unsalted sha256 hashes and the
    original plain-text passwords, so existing accounts keep working.
    """
    if not stored or candidate is None:
        return False

    if stored.startswith(("pbkdf2:", "scrypt:")):
        try:
            return check_password_hash(stored, candidate)
        except ValueError:
            return False

    if is_sha256_hash(stored):
        return hashlib.sha256(candidate.encode("utf-8")).hexdigest().lower() == stored.lower()

    return secrets.compare_digest(stored, candidate)


def hash_otp(otp_code):
    return hashlib.sha256(otp_code.encode("utf-8")).hexdigest()


# --- Request helpers ---

def get_current_admin():
    """Returns the JWT payload for the Authorization header, or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None


def fetch_admin_by_id(cursor, admin_id):
    cursor.execute(
        """
        SELECT admin_id, admin_email, admin_username, admin_password, role, created_date
        FROM admin_details
        WHERE admin_id = %s
        LIMIT 1
        """,
        (admin_id,),
    )
    rows = dict_rows(cursor, cursor.fetchall())
    return rows[0] if rows else None


def is_main_admin(claims):
    """Only the permanent main admin manages admin accounts."""
    return bool(claims) and claims.get("role") == MAIN_ROLE


def caller_is_main(cursor, claims):
    """Authoritative role check — reads the role from the database so a
    stale JWT claim can never grant admin-management rights."""
    caller = fetch_admin_by_id(cursor, claims["admin_id"])
    return bool(caller) and caller.get("role") == MAIN_ROLE


def build_token(admin):
    payload = {
        "admin_id": admin["admin_id"],
        "admin_email": admin["admin_email"],
        "admin_username": admin["admin_username"],
        "role": admin.get("role") or TEMPORARY_ROLE,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def public_admin(admin):
    role = admin.get("role") or TEMPORARY_ROLE
    return {
        "admin_id": admin["admin_id"],
        "admin_email": admin["admin_email"],
        "admin_username": admin["admin_username"],
        "role": role,
        "is_main": role == MAIN_ROLE,
        "created_date": admin.get("created_date"),
    }


def validate_new_password(password, confirm_password=None):
    """Returns an error string when the password is unusable, else None."""
    if not password:
        return "New password is required."
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
    if confirm_password is not None and password != confirm_password:
        return "Passwords do not match."
    return None


def open_connection():
    conn = get_connection(current_app.config["DB_CONFIG"])
    ensure_admin_tables(conn)
    return conn


# --- 1. LOGIN ROUTE ---

@auth_bp.route("/login", methods=["POST", "OPTIONS"], strict_slashes=False)
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json() or {}
    identifier = data.get("identifier", "").strip()
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Username/Email and password are required"}), 422

    conn = None
    try:
        conn = open_connection()

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT admin_id, admin_email, admin_username, admin_password, role, created_date
                FROM admin_details
                WHERE admin_email = %s OR admin_username = %s
                LIMIT 1
                """,
                (identifier, identifier),
            )
            rows = dict_rows(cursor, cursor.fetchall())

            if not rows:
                return jsonify({"error": "Invalid credentials"}), 401

            admin = rows[0]

            if not verify_password(admin["admin_password"], password):
                return jsonify({"error": "Invalid credentials"}), 401

            token = build_token(admin)

            return jsonify({
                "message": "Login successful",
                "token": token,
                "admin": public_admin(admin),
            }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Authentication error", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 2. TOKEN VERIFY ROUTE ---

@auth_bp.route("/verify", methods=["GET", "OPTIONS"])
def verify():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"valid": False, "error": "Missing token"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify({"valid": True, "admin": decoded}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"valid": False, "error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"valid": False, "error": "Invalid token"}), 401


# --- 3. CURRENT ADMIN PROFILE ---

@auth_bp.route("/me", methods=["GET", "OPTIONS"], strict_slashes=False)
def me():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    claims = get_current_admin()
    if not claims:
        return jsonify({"error": "Unauthorized"}), 401

    conn = None
    try:
        conn = open_connection()
        with conn.cursor() as cursor:
            admin = fetch_admin_by_id(cursor, claims["admin_id"])
        if not admin:
            return jsonify({"error": "Admin account no longer exists"}), 404
        return jsonify({"admin": public_admin(admin)}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to load account", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 4. CHANGE PASSWORD (signed-in admin) ---

@auth_bp.route("/change-password", methods=["POST", "OPTIONS"], strict_slashes=False)
def change_password():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    claims = get_current_admin()
    if not claims:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not current_password:
        return jsonify({"error": "Current password is required."}), 422

    error = validate_new_password(new_password, confirm_password)
    if error:
        return jsonify({"error": error}), 422

    conn = None
    try:
        conn = open_connection()
        with conn.cursor() as cursor:
            admin = fetch_admin_by_id(cursor, claims["admin_id"])
            if not admin:
                return jsonify({"error": "Admin account no longer exists"}), 404

            if not verify_password(admin["admin_password"], current_password):
                return jsonify({"error": "Current password is incorrect."}), 401

            if verify_password(admin["admin_password"], new_password):
                return jsonify({"error": "New password must be different from the current one."}), 422

            cursor.execute(
                "UPDATE admin_details SET admin_password = %s WHERE admin_id = %s",
                (hash_password(new_password), admin["admin_id"]),
            )
        conn.commit()

        return jsonify({"message": "Password changed successfully."}), 200

    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to change password", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 5. FORGOT PASSWORD (email an OTP) ---

def _lookup_admin_by_email(cursor, email):
    cursor.execute(
        """
        SELECT admin_id, admin_email, admin_username
        FROM admin_details
        WHERE LOWER(admin_email) = %s
        LIMIT 1
        """,
        (email,),
    )
    rows = dict_rows(cursor, cursor.fetchall())
    return rows[0] if rows else None


def _latest_active_otp(cursor, admin_id):
    cursor.execute(
        """
        SELECT otp_id, otp_code, attempts, expires_at
        FROM admin_otp
        WHERE admin_id = %s AND purpose = %s AND is_used = 0
        ORDER BY otp_id DESC
        LIMIT 1
        """,
        (admin_id, "password_reset"),
    )
    rows = dict_rows(cursor, cursor.fetchall())
    return rows[0] if rows else None


def _check_otp_or_error(cursor, conn, admin, otp_code):
    """Re-validates an OTP at use time. Returns (otp, None) or (None, response)."""
    otp = _latest_active_otp(cursor, admin["admin_id"])
    if not otp:
        return None, (jsonify({"error": "No active OTP found. Please request a new code."}), 404)

    if otp["expires_at"] < datetime.datetime.now():
        cursor.execute("UPDATE admin_otp SET is_used = 1 WHERE otp_id = %s", (otp["otp_id"],))
        conn.commit()
        return None, (jsonify({"error": "This OTP has expired. Please request a new code."}), 410)

    if otp["attempts"] >= MAX_OTP_ATTEMPTS:
        cursor.execute("UPDATE admin_otp SET is_used = 1 WHERE otp_id = %s", (otp["otp_id"],))
        conn.commit()
        return None, (jsonify({"error": "Too many incorrect attempts. Please request a new code."}), 429)

    if otp["otp_code"] != hash_otp(otp_code):
        cursor.execute(
            "UPDATE admin_otp SET attempts = attempts + 1 WHERE otp_id = %s",
            (otp["otp_id"],),
        )
        conn.commit()
        return None, (jsonify({
            "error": "Incorrect OTP. Please check the code and try again.",
            "attempts_remaining": max(MAX_OTP_ATTEMPTS - (otp["attempts"] + 1), 0),
        }), 401)

    return otp, None


@auth_bp.route("/forgot-password", methods=["POST", "OPTIONS"], strict_slashes=False)
def forgot_password():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Please enter your registered email address."}), 422

    conn = None
    try:
        conn = open_connection()
        with conn.cursor() as cursor:
            admin = _lookup_admin_by_email(cursor, email)

        if not admin:
            return jsonify({"error": "No admin account is registered with that email."}), 404

        otp_code = f"{secrets.randbelow(1000000):06d}"
        expires_at = datetime.datetime.now() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)

        # Plain-text OTPs are never stored, only a sha256 digest of them.
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE admin_otp SET is_used = 1 WHERE admin_id = %s AND purpose = %s AND is_used = 0",
                (admin["admin_id"], "password_reset"),
            )
            cursor.execute(
                """
                INSERT INTO admin_otp (admin_id, otp_code, purpose, expires_at)
                VALUES (%s, %s, %s, %s)
                """,
                (admin["admin_id"], hash_otp(otp_code), "password_reset", expires_at),
            )
        conn.commit()

        try:
            send_otp_email(
                admin["admin_email"],
                otp_code,
                username=admin["admin_username"],
                expiry_minutes=OTP_EXPIRY_MINUTES,
            )
        except (smtplib.SMTPException, RuntimeError, OSError) as e:
            traceback.print_exc()
            return jsonify({
                "error": "Unable to send the OTP email right now. Please try again later.",
                "details": str(e),
            }), 502

        return jsonify({
            "message": "An OTP has been sent to your registered email address.",
            "email": admin["admin_email"],
            "expires_in_minutes": OTP_EXPIRY_MINUTES,
        }), 200

    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to start password reset", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 6. VERIFY OTP ---

@auth_bp.route("/verify-otp", methods=["POST", "OPTIONS"], strict_slashes=False)
def verify_otp():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp_code = str(data.get("otp", "")).strip()

    if not email or not otp_code:
        return jsonify({"error": "Email and OTP are required."}), 422

    conn = None
    try:
        conn = open_connection()
        with conn.cursor() as cursor:
            admin = _lookup_admin_by_email(cursor, email)
            if not admin:
                return jsonify({"error": "No admin account is registered with that email."}), 404

            otp, error_response = _check_otp_or_error(cursor, conn, admin, otp_code)
            if error_response:
                return error_response

        return jsonify({"message": "OTP verified.", "email": admin["admin_email"]}), 200

    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to verify OTP", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 7. RESET PASSWORD (requires a valid OTP) ---

@auth_bp.route("/reset-password", methods=["POST", "OPTIONS"], strict_slashes=False)
def reset_password():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp_code = str(data.get("otp", "")).strip()
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not email or not otp_code:
        return jsonify({"error": "Email and OTP are required."}), 422

    error = validate_new_password(new_password, confirm_password)
    if error:
        return jsonify({"error": error}), 422

    conn = None
    try:
        conn = open_connection()
        with conn.cursor() as cursor:
            admin = _lookup_admin_by_email(cursor, email)
            if not admin:
                return jsonify({"error": "No admin account is registered with that email."}), 404

            # The OTP is re-checked here, so the password is only ever
            # changed when a valid code is presented.
            otp, error_response = _check_otp_or_error(cursor, conn, admin, otp_code)
            if error_response:
                return error_response

            cursor.execute(
                "UPDATE admin_details SET admin_password = %s WHERE admin_id = %s",
                (hash_password(new_password), admin["admin_id"]),
            )
            cursor.execute("UPDATE admin_otp SET is_used = 1 WHERE otp_id = %s", (otp["otp_id"],))
        conn.commit()

        return jsonify({"message": "Password reset successfully. You can now sign in."}), 200

    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to reset password", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 8. ADMIN ACCOUNT MANAGEMENT ---

@auth_bp.route("/admins", methods=["GET", "POST", "OPTIONS"], strict_slashes=False)
def admins_collection():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    claims = get_current_admin()
    if not claims:
        return jsonify({"error": "Unauthorized"}), 401

    # Managing admin accounts is reserved for the main admin.
    if not is_main_admin(claims):
        return jsonify({"error": MAIN_ADMIN_ONLY}), 403

    if request.method == "GET":
        conn = None
        try:
            conn = open_connection()
            with conn.cursor() as cursor:
                if not caller_is_main(cursor, claims):
                    return jsonify({"error": MAIN_ADMIN_ONLY}), 403

                cursor.execute(
                    """
                    SELECT admin_id, admin_email, admin_username, role, created_date
                    FROM admin_details
                    ORDER BY (role = 'main') DESC, admin_id ASC
                    """
                )
                admins = dict_rows(cursor, cursor.fetchall())
            return jsonify([public_admin(a) for a in admins]), 200
        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": "Failed to load admins", "details": str(e)}), 500
        finally:
            if conn:
                conn.close()

    data = request.get_json() or {}
    email = data.get("admin_email", "").strip().lower()
    username = data.get("admin_username", "").strip()
    password = data.get("admin_password", "")

    if not email or not username or not password:
        return jsonify({"error": "Email, username and password are all required."}), 422

    error = validate_new_password(password)
    if error:
        return jsonify({"error": error}), 422

    conn = None
    try:
        conn = open_connection()
        with conn.cursor() as cursor:
            if not caller_is_main(cursor, claims):
                return jsonify({"error": MAIN_ADMIN_ONLY}), 403

            cursor.execute(
                """
                SELECT admin_id FROM admin_details
                WHERE LOWER(admin_email) = %s OR admin_username = %s
                LIMIT 1
                """,
                (email, username),
            )
            if cursor.fetchall():
                return jsonify({"error": "An admin with that email or username already exists."}), 409

            cursor.execute(
                """
                INSERT INTO admin_details (admin_email, admin_username, admin_password, role)
                VALUES (%s, %s, %s, %s)
                """,
                (email, username, hash_password(password), TEMPORARY_ROLE),
            )
            new_admin = fetch_admin_by_id(cursor, cursor.lastrowid)
        conn.commit()

        return jsonify({
            "message": "Temporary admin account created.",
            "admin": public_admin(new_admin),
        }), 201

    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to create admin", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


@auth_bp.route("/admins/<int:admin_id>", methods=["PUT", "DELETE", "OPTIONS"])
def admin_detail(admin_id):
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    claims = get_current_admin()
    if not claims:
        return jsonify({"error": "Unauthorized"}), 401

    # Managing admin accounts is reserved for the main admin.
    if not is_main_admin(claims):
        return jsonify({"error": MAIN_ADMIN_ONLY}), 403

    conn = None
    try:
        conn = open_connection()
        with conn.cursor() as cursor:
            if not caller_is_main(cursor, claims):
                return jsonify({"error": MAIN_ADMIN_ONLY}), 403

            admin = fetch_admin_by_id(cursor, admin_id)
            if not admin:
                return jsonify({"error": "Admin account not found."}), 404

            if request.method == "DELETE":
                if admin.get("role") == MAIN_ROLE:
                    return jsonify({"error": "The main admin account cannot be deleted."}), 422
                if admin_id == claims["admin_id"]:
                    return jsonify({"error": "You cannot delete the account you are signed in with."}), 422

                cursor.execute("DELETE FROM admin_details WHERE admin_id = %s", (admin_id,))
                conn.commit()
                return jsonify({"message": "Admin account deleted."}), 200

            data = request.get_json() or {}
            email = data.get("admin_email", "").strip().lower()
            username = data.get("admin_username", "").strip()
            new_password = data.get("admin_password", "")

            if not email or not username:
                return jsonify({"error": "Email and username are required."}), 422

            cursor.execute(
                """
                SELECT admin_id FROM admin_details
                WHERE (LOWER(admin_email) = %s OR admin_username = %s) AND admin_id <> %s
                LIMIT 1
                """,
                (email, username, admin_id),
            )
            if cursor.fetchall():
                return jsonify({"error": "Another admin already uses that email or username."}), 409

            if new_password:
                # Blank means "keep the existing password".
                error = validate_new_password(new_password)
                if error:
                    return jsonify({"error": error}), 422
                cursor.execute(
                    """
                    UPDATE admin_details
                    SET admin_email = %s, admin_username = %s, admin_password = %s
                    WHERE admin_id = %s
                    """,
                    (email, username, hash_password(new_password), admin_id),
                )
            else:
                cursor.execute(
                    """
                    UPDATE admin_details
                    SET admin_email = %s, admin_username = %s
                    WHERE admin_id = %s
                    """,
                    (email, username, admin_id),
                )

            updated = fetch_admin_by_id(cursor, admin_id)
        conn.commit()

        return jsonify({
            "message": "Admin account updated.",
            "admin": public_admin(updated),
        }), 200

    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to update admin", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()
