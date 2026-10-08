from flask import Blueprint, request, jsonify, current_app
from src.db import get_connection  # or: from db import get_connection

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")


# POST: Create a new job post (status defaults to 1)
@jobs_bp.route("", methods=["POST"])
def create_job():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    job_title = data.get("job_title")
    job_experience = data.get("job_experience")
    job_location = data.get("job_location")
    job_type = data.get("job_type")
    job_description = data.get("job_description")

    # Fix: Safely set job_status to 1 regardless of whether React sends "Active", 1, or nothing
    raw_status = data.get("job_status", 1)
    if str(raw_status).lower() in ["active", "1", "true"]:
        job_status = 1
    else:
        job_status = 0

    if not all([job_title, job_location, job_type, job_description]):
        return jsonify({"error": "Missing required fields"}), 422

    query = """
        INSERT INTO career_post (job_title, job_experience, job_location, job_type, job_description, job_status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(
                query,
                (
                    job_title.strip(),
                    job_experience.strip() if job_experience else None,
                    job_location.strip(),
                    job_type.strip(),
                    job_description.strip(),
                    job_status,
                ),
            )
            job_id = cursor.lastrowid
        conn.commit()

        return jsonify({
            "message": "Job posted successfully",
            "job_id": job_id,
            "job_status": job_status
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    finally:
        if conn:
            conn.close()

# GET: Fetch only active jobs (job_status = 1)
@jobs_bp.route("", methods=["GET"])
def get_jobs():
    query = "SELECT * FROM career_post WHERE job_status = 1 ORDER BY job_id DESC"
    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(query)
            jobs = cursor.fetchall()
        return jsonify(jobs), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch jobs", "details": str(e)}), 500

    finally:
        if conn:
            conn.close()


# DELETE: Soft-delete by setting job_status to 0
@jobs_bp.route("/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):
    query = "UPDATE career_post SET job_status = 0 WHERE job_id = %s"
    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(query, (job_id,))
            rows_affected = cursor.rowcount

        if rows_affected == 0:
            return jsonify({"error": "Job not found"}), 404

        conn.commit()
        return jsonify({"message": f"Job {job_id} deleted successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    finally:
        if conn:
            conn.close()


# PUT: Update an existing job post
@jobs_bp.route("/<int:job_id>", methods=["PUT"])
def update_job(job_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    job_title = data.get("job_title")
    job_experience = data.get("job_experience")
    job_location = data.get("job_location")
    job_type = data.get("job_type")
    job_description = data.get("job_description")

    if not all([job_title, job_experience, job_location, job_type, job_description]):
        return jsonify({"error": "Missing required fields"}), 422

    query = """
        UPDATE career_post 
        SET job_title = %s, job_experience = %s, job_location = %s, job_type = %s, job_description = %s
        WHERE job_id = %s AND job_status = 1
    """

    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(
                query,
                (
                    job_title.strip(),
                    job_experience.strip() if job_experience else None,
                    job_location.strip(),
                    job_type.strip(),
                    job_description.strip(),
                    job_id,
                ),
            )
            rows_affected = cursor.rowcount

        if rows_affected == 0:
            return jsonify({"error": "Job not found or already deleted"}), 404

        conn.commit()
        return jsonify({"message": f"Job {job_id} updated successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    finally:
        if conn:
            conn.close()            