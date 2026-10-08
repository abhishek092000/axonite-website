import os
import traceback
from datetime import date
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from src.db import get_connection

applied_jobs_bp = Blueprint("applied_jobs", __name__, url_prefix="/api/applied_jobs")

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "resumes")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# --- 1. SUBMIT APPLICATION ---
@applied_jobs_bp.route("", methods=["POST"], strict_slashes=False)
@applied_jobs_bp.route("/", methods=["POST"], strict_slashes=False)
def apply_for_job():
    data = request.form
    file = request.files.get("resume")

    raw_job_id = data.get("job_id")
    job_id = int(raw_job_id) if raw_job_id and str(raw_job_id).isdigit() else None

    user_name = data.get("user_name", "").strip()
    user_email = data.get("user_email", "").strip()
    user_mobile = data.get("user_mobile", "").strip()
    user_qualification = data.get("user_qualifications", "").strip()
    user_experience = data.get("user_experience")
    user_residential = data.get("user_residential")
    user_linkedin = data.get("user_linkedin")
    user_status = int(data.get("user_status", 1))

    if not user_name or not user_email or not user_mobile or not user_qualification:
        return jsonify({"error": "Missing required fields"}), 422

    if not file or file.filename == "":
        return jsonify({"error": "Resume file is required"}), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{int(os.times().system * 1000)}_{filename}"
    file.save(os.path.join(UPLOAD_FOLDER, unique_filename))

    query = """
        INSERT INTO applied_user (
            job_id,
            user_name,
            user_mobile,
            user_email,
            user_qualification,
            user_experience,
            user_residential,
            user_resume,
            applied_date,
            user_status,
            user_linkedin
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURDATE(), %s, %s)
    """

    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(
                query,
                (
                    job_id,
                    user_name,
                    user_mobile,
                    user_email,
                    user_qualification,
                    user_experience.strip() if user_experience else None,
                    user_residential.strip() if user_residential else None,
                    unique_filename,
                    user_status,
                    user_linkedin.strip() if user_linkedin else None,
                ),
            )
            applied_id = cursor.lastrowid
        conn.commit()

        return jsonify({
            "message": "Application submitted successfully",
            "applied_id": applied_id,
            "user_status": user_status,
        }), 201

    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 2. FETCH ALL APPLICATIONS ---
@applied_jobs_bp.route("", methods=["GET"], strict_slashes=False)
@applied_jobs_bp.route("/", methods=["GET"], strict_slashes=False)
def get_all_applications():
    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])

        # Safely try dictionary cursor for mysql.connector, otherwise standard cursor
        try:
            cursor = conn.cursor(dictionary=True)
        except (TypeError, AttributeError):
            cursor = conn.cursor()

        query = """
            SELECT 
                a.user_id,
                a.job_id,
                a.user_name,
                CAST(a.user_mobile AS CHAR) AS user_mobile,
                a.user_email,
                a.user_qualification,
                a.user_experience,
                a.user_residential,
                a.user_resume,
                DATE_FORMAT(a.applied_date, '%Y-%m-%d') AS applied_date,
                a.user_status,
                a.user_linkedin,
                COALESCE(c.job_title, 'General Application') AS job_title,
                COALESCE(c.job_experience, 'N/A') AS job_experience
            FROM applied_user a
            LEFT JOIN career_post c ON a.job_id = c.job_id
            ORDER BY a.user_id DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        # Handle tuple fallback if standard tuple cursor was used
        if rows and isinstance(rows[0], (tuple, list)):
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in rows]

        cursor.close()
        return jsonify(rows or []), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch applications", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 3. UPDATE APPLICATION STATUS ---
@applied_jobs_bp.route("/<int:user_id>/status", methods=["PATCH"])
def update_status(user_id):
    data = request.get_json() or {}
    new_status = data.get("user_status")

    if new_status is None:
        return jsonify({"error": "Missing user_status"}), 400

    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE applied_user SET user_status = %s WHERE user_id = %s",
                (int(new_status), user_id),
            )
        conn.commit()
        return jsonify({"message": "Status updated successfully"}), 200
    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to update status", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 4. SERVE RESUME FILES ---
@applied_jobs_bp.route("/resume/<filename>", methods=["GET"])
def view_resume(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, mimetype="application/pdf")