from flask import Blueprint, jsonify, current_app
from src.db import get_connection

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/counts", methods=["GET"])
def get_db_counts():
    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        
        try:
            cursor = conn.cursor(dictionary=True)
        except (TypeError, AttributeError):
            cursor = conn.cursor()

        # Direct SQL count for blog posts
        cursor.execute("SELECT COUNT(*) AS total_blogs FROM blog_post")
        blog_row = cursor.fetchone()
        blog_count = blog_row["total_blogs"] if isinstance(blog_row, dict) else blog_row[0]

        # Direct SQL count for open jobs (adjust table or WHERE clause if needed)
        cursor.execute("SELECT COUNT(*) AS total_jobs FROM career_post where job_status = 1")
        job_row = cursor.fetchone()
        job_count = job_row["total_jobs"] if isinstance(job_row, dict) else job_row[0]

        cursor.close()

        return jsonify({
            "blog_count": blog_count,
            "job_count": job_count
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to retrieve counts", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()