import datetime
import traceback
import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash
from src.db import get_connection

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

JWT_SECRET = "your-very-secure-jwt-secret-key-change-this"
JWT_EXPIRATION_HOURS = 24


# --- 1. LOGIN ROUTE ---
@auth_bp.route("/login", methods=["POST"], strict_slashes=False)
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
        conn = get_connection(current_app.config["DB_CONFIG"])
        
        try:
            cursor = conn.cursor(dictionary=True)
        except (TypeError, AttributeError):
            cursor = conn.cursor()

        # Query matches either admin_email or admin_username
        query = """
            SELECT admin_id, admin_email, admin_username, admin_password 
            FROM admin_details 
            WHERE admin_email = %s OR admin_username = %s 
            LIMIT 1
        """
        cursor.execute(query, (identifier, identifier))
        row = cursor.fetchone()

        # Handle tuple fallback if dict cursor is unsupported
        if row and isinstance(row, (tuple, list)):
            columns = [col[0] for col in cursor.description]
            row = dict(zip(columns, row))

        cursor.close()

        if not row:
            return jsonify({"error": "Invalid credentials"}), 401

        db_password = row["admin_password"]

        # Support both hashed passwords and plain text passwords
        is_valid = False
        try:
            if check_password_hash(db_password, password):
                is_valid = True
        except ValueError:
            # Fallback if db_password is not a werkzeug hash string
            pass

        if not is_valid and db_password == password:
            is_valid = True

        if not is_valid:
            return jsonify({"error": "Invalid credentials"}), 401

        # Generate 24-hour JWT token
        payload = {
            "admin_id": row["admin_id"],
            "admin_email": row["admin_email"],
            "admin_username": row["admin_username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        return jsonify({
            "message": "Login successful",
            "token": token,
            "admin": {
                "admin_id": row["admin_id"],
                "admin_email": row["admin_email"],
                "admin_username": row["admin_username"],
            },
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Authentication error", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 2. TOKEN VERIFY ROUTE ---
@auth_bp.route("/verify", methods=["GET"])
def verify():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"valid": False, "error": "Missing token"}), 401

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify({"valid": True, "admin": decoded}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"valid": False, "error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"valid": False, "error": "Invalid token"}), 401