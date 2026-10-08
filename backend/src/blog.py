import traceback
from flask import Blueprint, request, jsonify, current_app
from src.db import get_connection

blog_bp = Blueprint("blog", __name__, url_prefix="/api/blog")


# --- 1. GET ALL POSTS ---
@blog_bp.route("", methods=["GET"], strict_slashes=False)
@blog_bp.route("/", methods=["GET"], strict_slashes=False)
def get_posts():
    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        try:
            cursor = conn.cursor(dictionary=True)
        except (TypeError, AttributeError):
            cursor = conn.cursor()

        # Format system date into readable format: "06 Sep 2026"
        query = """
            SELECT 
                blog_id AS id,
                blog_title AS title,
                blog_sub_title AS tag,
                blog_image AS image,
                blog_video AS video,
                `blog content` AS excerpt,
                DATE_FORMAT(COALESCE(created_date, CURDATE()), '%d %b %Y') AS formatted_date,
                DATE_FORMAT(COALESCE(created_date, CURDATE()), '%Y-%m-%d') AS raw_date
            FROM blog_post
            ORDER BY blog_id DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        if rows and isinstance(rows[0], (tuple, list)):
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in rows]

        cursor.close()
        return jsonify(rows or []), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch posts", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 2. CREATE POST ---
@blog_bp.route("", methods=["POST"], strict_slashes=False)
@blog_bp.route("/", methods=["POST"], strict_slashes=False)
def create_post():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    tag = data.get("tag", "").strip()
    image = data.get("image", "")
    video = data.get("video", "")
    content = data.get("excerpt", "").strip()

    if not title:
        return jsonify({"error": "Title is required"}), 422

    # CURDATE() automatically assigns the server's current date
    query = """
        INSERT INTO blog_post (blog_title, blog_sub_title, blog_image, blog_video, `blog content`, created_date)
        VALUES (%s, %s, %s, %s, %s, CURDATE())
    """

    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(query, (title, tag, image, video, content))
            post_id = cursor.lastrowid
        conn.commit()
        return jsonify({"message": "Post published", "id": post_id}), 201
    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to create post", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 3. UPDATE POST ---
@blog_bp.route("/<int:post_id>", methods=["PUT"])
def update_post(post_id):
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    tag = data.get("tag", "").strip()
    image = data.get("image", "")
    video = data.get("video", "")
    content = data.get("excerpt", "").strip()

    if not title:
        return jsonify({"error": "Title is required"}), 422

    query = """
        UPDATE blog_post 
        SET blog_title = %s, blog_sub_title = %s, blog_image = %s, blog_video = %s, `blog content` = %s
        WHERE blog_id = %s
    """

    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute(query, (title, tag, image, video, content, post_id))
        conn.commit()
        return jsonify({"message": "Post updated successfully"}), 200
    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to update post", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- 4. DELETE POST ---
@blog_bp.route("/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    conn = None
    try:
        conn = get_connection(current_app.config["DB_CONFIG"])
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM blog_post WHERE blog_id = %s", (post_id,))
        conn.commit()
        return jsonify({"message": "Post deleted successfully"}), 200
    except Exception as e:
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to delete post", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()