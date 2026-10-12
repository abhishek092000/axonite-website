import os
import re
import smtplib
from email.message import EmailMessage
import requests
from flask import Blueprint, jsonify, request

contact_bp = Blueprint("contact_bp", __name__)

CLOUDFLARE_SECRET_KEY = os.getenv("CLOUDFLARE_TURNSTILE_SECRET_KEY")


def verify_turnstile(token: str, remote_ip: str | None = None) -> bool:
    """Verifies Cloudflare Turnstile token server-side."""
    if not CLOUDFLARE_SECRET_KEY:
        # Development fallback if secret key is not configured yet
        print("WARNING: CLOUDFLARE_TURNSTILE_SECRET_KEY is missing from environment.")
        return True

    payload = {
        "secret": CLOUDFLARE_SECRET_KEY,
        "response": token,
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        res = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data=payload,
            timeout=10,
        )
        data = res.json()
        return data.get("success", False)
    except Exception as e:
        print("Turnstile verification error:", repr(e))
        return False


# Route matches your frontend URL: http://localhost:5000/api/contact
@contact_bp.route("/contact", methods=["POST"])
def contact():
    try:
        # 1. Parse JSON body from React
        data = request.get_json(silent=True) or {}

        username = data.get("username", "").strip()
        work_email = data.get("workEmail", "").strip()
        company_name = data.get("companyName", "").strip()
        description = data.get("description", "").strip()
        turnstile_token = data.get("turnstileToken", "").strip()

        # -------------------------
        # Cloudflare Verification
        # -------------------------
        if not turnstile_token:
            return jsonify({
                "success": False,
                "field": "turnstile",
                "message": "Security verification is missing. Please complete the CAPTCHA.",
            }), 400

        client_ip = request.headers.get("CF-Connecting-IP") or request.remote_addr
        if not verify_turnstile(turnstile_token, client_ip):
            return jsonify({
                "success": False,
                "field": "turnstile",
                "message": "Security verification failed. Please try again.",
            }), 400

        # -------------------------
        # Input Validations
        # -------------------------
        if not username:
            return jsonify({
                "success": False,
                "field": "username",
                "message": "Please enter your name.",
            }), 400

        if len(username) > 100:
            return jsonify({
                "success": False,
                "field": "username",
                "message": "Name cannot be longer than 100 characters.",
            }), 400

        if not work_email:
            return jsonify({
                "success": False,
                "field": "workEmail",
                "message": "Please enter your work email.",
            }), 400

        email_pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        if not re.match(email_pattern, work_email):
            return jsonify({
                "success": False,
                "field": "workEmail",
                "message": "Please enter a valid work email.",
            }), 400

        if not company_name:
            return jsonify({
                "success": False,
                "field": "companyName",
                "message": "Please enter your company name.",
            }), 400

        if len(company_name) > 200:
            return jsonify({
                "success": False,
                "field": "companyName",
                "message": "Company name cannot be longer than 200 characters.",
            }), 400

        if not description:
            return jsonify({
                "success": False,
                "field": "description",
                "message": "Please enter your project details.",
            }), 400

        if len(description) > 5000:
            return jsonify({
                "success": False,
                "field": "description",
                "message": "Project details cannot be longer than 5000 characters.",
            }), 400

        # -------------------------
        # Email Credentials Check
        # -------------------------
        mail_username = os.getenv("MAIL_USERNAME")
        mail_password = os.getenv("MAIL_PASSWORD")
        mail_receiver = os.getenv("MAIL_RECEIVER")

        if not mail_username or not mail_password or not mail_receiver:
            print("Missing MAIL environment variables.")
            return jsonify({
                "success": False,
                "message": "Email server configuration is incomplete.",
            }), 500

        # -------------------------
        # Compose & Send Email
        # -------------------------
        msg = EmailMessage()
        msg["From"] = mail_username
        msg["To"] = mail_receiver
        msg["Reply-To"] = work_email
        msg["Subject"] = f"New Contact Request: {company_name}"

        msg.set_content(
            f"""\
New Contact Form Submission
========================================

Name:
{username}

Work Email:
{work_email}

Company Name:
{company_name}

Project Description:
{description}

========================================
Sent via Axonite contact portal.
"""
        )

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as smtp:
            smtp.starttls()
            smtp.login(mail_username, mail_password)
            smtp.send_message(msg)

        return jsonify({
            "success": True,
            "message": "Message sent successfully.",
        }), 200

    except smtplib.SMTPAuthenticationError as e:
        print("Gmail SMTP Auth Failure:", repr(e))
        return jsonify({
            "success": False,
            "message": "Email server authentication failed.",
        }), 500

    except Exception as e:
        print("Contact Endpoint Error:", type(e).__name__, repr(e))
        return jsonify({
            "success": False,
            "message": "Unable to process request right now. Please try again later.",
        }), 500