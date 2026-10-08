import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from flask import Blueprint, current_app, jsonify, request
import pymysql

schedule_bp = Blueprint("schedule_bp", __name__)


def get_db_connection():
    """Establishes connection using DB_CONFIG defined in app.py."""
    config = current_app.config["DB_CONFIG"]
    return pymysql.connect(**config)


def send_interview_email(candidate_email, candidate_name, round_number, mode, scheduled_at, link_or_location):
    """Sends an automated interview invitation email to the candidate."""
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")

    if not mail_username or not mail_password or not candidate_email:
        return

    try:
        msg = EmailMessage()
        msg["From"] = mail_username
        msg["To"] = candidate_email
        msg["Subject"] = f"Interview Scheduled — Round {round_number}"

        formatted_time = scheduled_at.strftime("%A, %d %B %Y at %I:%M %p")
        location_header = "Meeting Link" if mode == "online" else "Office Location"

        msg.set_content(
            f"""\
Hello {candidate_name},

Your Round {round_number} interview has been scheduled.

Details:
- Interview Mode: {mode.capitalize()}
- Date & Time: {formatted_time}
- {location_header}: {link_or_location or "To be shared soon"}

Please let us know if you need to reschedule in advance.

Best regards,
Hiring Team
"""
        )

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as smtp:
            smtp.starttls()
            smtp.login(mail_username, mail_password)
            smtp.send_message(msg)
    except Exception as e:
        print("Failed to dispatch interview email:", repr(e))


@schedule_bp.route("/schedule-interview", methods=["POST"])
def schedule_interview():
    try:
        data = request.get_json(silent=True) or {}

        user_id = data.get("user_id")
        job_id = data.get("job_id")
        round_number = data.get("round_number", 1)
        round_name = data.get("round_name", f"Round {round_number}")
        interview_mode = data.get("interview_mode", "online").lower()
        scheduled_at_raw = data.get("scheduled_at", "").strip()
        meeting_link = data.get("meeting_link", "").strip()
        location = data.get("location", "").strip()
        notes = data.get("notes", "").strip()

        # -------------------------
        # Validations
        # -------------------------
        if not user_id:
            return jsonify({"success": False, "message": "user_id is required."}), 400

        if not scheduled_at_raw:
            return jsonify({"success": False, "message": "Please select an interview date and time."}), 400

        if interview_mode not in ("online", "offline"):
            return jsonify({"success": False, "message": "Invalid interview mode."}), 400

        if interview_mode == "online" and not meeting_link:
            return jsonify({"success": False, "message": "Please provide a meeting link for online interviews."}), 400

        # Parse datetime format (supports 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DD HH:MM:SS')
        try:
            scheduled_at = datetime.fromisoformat(scheduled_at_raw.replace("Z", ""))
        except ValueError:
            return jsonify({"success": False, "message": "Invalid date-time format."}), 400

        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # 1. Fetch applicant data
                cursor.execute(
                    "SELECT user_id, user_name, user_email, job_id FROM applied_user WHERE user_id = %s",
                    (user_id,),
                )
                applicant = cursor.fetchone()

                if not applicant:
                    return jsonify({"success": False, "message": "Applicant not found."}), 404

                # Fallback to job_id from applicant table if not sent in payload
                resolved_job_id = job_id or applicant.get("job_id")

                # 2. Insert interview schedule record
                insert_query = """
                    INSERT INTO interview_schedules (
                        user_id, job_id, round_number, round_name,
                        interview_mode, scheduled_at, meeting_link,
                        location, notes, status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'scheduled')
                """
                cursor.execute(
                    insert_query,
                    (
                        user_id,
                        resolved_job_id,
                        round_number,
                        round_name,
                        interview_mode,
                        scheduled_at,
                        meeting_link if interview_mode == "online" else None,
                        location if interview_mode == "offline" else None,
                        notes or None,
                    ),
                )
                schedule_id = cursor.lastrowid

                # 3. Update candidate status in applied_user
                update_query = """
                    UPDATE applied_user
                    SET user_status = %s
                    WHERE user_id = %s
                """
                cursor.execute(update_query, (f"Round {round_number} Scheduled", user_id))

                conn.commit()

            # 4. Asynchronously or inline send email notification
            target_coordinate = meeting_link if interview_mode == "online" else location
            send_interview_email(
                candidate_email=applicant.get("user_email"),
                candidate_name=applicant.get("user_name"),
                round_number=round_number,
                mode=interview_mode,
                scheduled_at=scheduled_at,
                link_or_location=target_coordinate,
            )

            return jsonify({
                "success": True,
                "message": f"Round {round_number} interview scheduled successfully.",
                "schedule_id": schedule_id,
            }), 201

        finally:
            conn.close()

    except Exception as e:
        print("Schedule endpoint error:", repr(e))
        return jsonify({"success": False, "message": "Internal server error occurred."}), 500


@schedule_bp.route("/candidate/<int:user_id>/interviews", methods=["GET"])
def get_candidate_interviews(user_id):
    """Fetches all scheduled rounds for an applicant."""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT schedule_id, user_id, job_id, round_number, round_name,
                           interview_mode, scheduled_at, meeting_link, location,
                           status, notes, created_at
                    FROM interview_schedules
                    WHERE user_id = %s
                    ORDER BY round_number ASC
                    """,
                    (user_id,),
                )
                interviews = cursor.fetchall()
            return jsonify({"success": True, "interviews": interviews}), 200
        finally:
            conn.close()
    except Exception as e:
        print("Fetch interviews error:", repr(e))
        return jsonify({"success": False, "message": "Failed to retrieve interviews."}), 500


@schedule_bp.route("/reschedule-interview", methods=["PATCH"])
def reschedule_interview():
    try:
        data = request.get_json(silent=True) or {}

        user_id = data.get("user_id")
        round_number = data.get("round_number", 1)
        interview_mode = data.get("interview_mode", "online").lower()
        scheduled_at_raw = data.get("scheduled_at", "").strip()
        meeting_link = data.get("meeting_link", "").strip()
        location = data.get("location", "").strip()

        if not user_id or not scheduled_at_raw:
            return jsonify({"success": False, "message": "user_id and scheduled_at are required."}), 400

        try:
            scheduled_at = datetime.fromisoformat(scheduled_at_raw.replace("Z", ""))
        except ValueError:
            return jsonify({"success": False, "message": "Invalid date-time format."}), 400

        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT user_name, user_email FROM applied_user WHERE user_id = %s",
                    (user_id,),
                )
                applicant = cursor.fetchone()
                if not applicant:
                    return jsonify({"success": False, "message": "Applicant not found."}), 404

                # Update schedule record
                update_query = """
                    UPDATE interview_schedules
                    SET interview_mode = %s,
                        scheduled_at = %s,
                        meeting_link = %s,
                        location = %s,
                        status = 'rescheduled'
                    WHERE user_id = %s AND round_number = %s
                """
                cursor.execute(
                    update_query,
                    (
                        interview_mode,
                        scheduled_at,
                        meeting_link if interview_mode == "online" else None,
                        location if interview_mode == "offline" else None,
                        user_id,
                        round_number,
                    ),
                )
                conn.commit()

            # Dispatch updated notification
            target_coordinate = meeting_link if interview_mode == "online" else location
            send_interview_email(
                candidate_email=applicant.get("user_email"),
                candidate_name=applicant.get("user_name"),
                round_number=round_number,
                mode=interview_mode,
                scheduled_at=scheduled_at,
                link_or_location=target_coordinate,
            )

            return jsonify({"success": True, "message": "Interview rescheduled successfully."}), 200
        finally:
            conn.close()

    except Exception as e:
        print("Reschedule error:", repr(e))
        return jsonify({"success": False, "message": "Failed to reschedule interview."}), 500