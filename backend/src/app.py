import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
import pymysql

# Load environment variables (.env)
load_dotenv()

# Direct imports from the same directory
from job_post import jobs_bp
from applied_job import applied_jobs_bp
from blog import blog_bp
from auth import auth_bp
from dashboard import dashboard_bp
from contact import contact_bp
from schedule import schedule_bp
from chatbot.rag.rag import rag_bp

app = Flask(__name__)

# --- Configure CORS ---
# Allows frontend development server (Vite on port 5173) and supports JSON preflights
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "default-secret-key")

# --- Configuration & Credentials ---
PORT = 5000
HOST = "0.0.0.0"

app.config["DB_CONFIG"] = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "axo",
    "port": 3306,
    "cursorclass": pymysql.cursors.DictCursor,
}

# --- Register Blueprints ---
app.register_blueprint(jobs_bp)
app.register_blueprint(applied_jobs_bp)
app.register_blueprint(blog_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(contact_bp, url_prefix="/api")
app.register_blueprint(schedule_bp, url_prefix="/api")
app.register_blueprint(rag_bp, url_prefix="/api")


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(debug=True, host=HOST, port=PORT)

    # uv run python -m src.app