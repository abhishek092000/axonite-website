"""Shared SMTP helpers.

Credentials come from the same MAIL_* environment variables the contact
form already uses, so no extra configuration is needed.
"""

import os
import smtplib
from email.message import EmailMessage


def send_email(to_email, subject, body, reply_to=None):
    """Sends a plain-text email. Raises RuntimeError if config or SMTP fails."""
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")

    if not mail_username or not mail_password:
        raise RuntimeError("Email service is not configured (MAIL_USERNAME/MAIL_PASSWORD).")

    msg = EmailMessage()
    msg["From"] = mail_username
    msg["To"] = to_email
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as smtp:
        smtp.starttls()
        smtp.login(mail_username, mail_password)
        smtp.send_message(msg)


def send_otp_email(to_email, otp_code, username="", expiry_minutes=10):
    """Sends the admin password-reset OTP."""
    greeting = f"Hi {username}," if username else "Hi,"
    body = f"""\
{greeting}

A request was made to reset the password for your Axonite admin account.

Your one-time password (OTP) is:

    {otp_code}

This code expires in {expiry_minutes} minutes and can only be used once.
If you did not request a password reset, you can safely ignore this email.

— Axonite Admin Panel
"""
    send_email(to_email, "Axonite admin password reset OTP", body)
