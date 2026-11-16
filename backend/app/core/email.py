import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, otp_code: str, candidate_name: str = "") -> bool:
    """
    Sends a 6-digit verification code to the candidate's email address
    via Gmail SMTP (TLS on port 587).
    """
    subject = f"Your TalentBridge Verification Code: {otp_code}"
    display_name = candidate_name.strip() if candidate_name and candidate_name.strip() else "Candidate"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TalentBridge Verification</title>
      <style>
        body {{
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #F4F7FB;
          margin: 0;
          padding: 24px;
        }}
        .container {{
          max-width: 520px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #E2E8F0;
        }}
        .header {{
          background: linear-gradient(135deg, #0B1528 0%, #16243D 100%);
          padding: 28px;
          text-align: center;
        }}
        .logo {{
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.5px;
        }}
        .logo span {{
          color: #00D2B4;
        }}
        .content {{
          padding: 32px 28px;
          color: #1F2937;
        }}
        .title {{
          font-size: 20px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 12px;
        }}
        .text {{
          font-size: 14.5px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }}
        .otp-box {{
          background: #F0FDFA;
          border: 2px dashed #0D9488;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 24px 0;
        }}
        .otp-code {{
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #0F766E;
          font-family: 'Courier New', Courier, monospace;
        }}
        .footer {{
          background-color: #F8FAFC;
          padding: 20px 28px;
          text-align: center;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #EDF2F7;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Talent<span>Bridge</span></div>
          <div style="color: #94A3B8; font-size: 12px; margin-top: 4px;">AI-Powered Candidate Screening</div>
        </div>
        <div class="content">
          <div class="title">Verify Your Application</div>
          <div class="text">
            Hello <strong>{display_name}</strong>,<br><br>
            Thank you for applying through the TalentBridge Career Portal. Please use the 6-digit verification code below to verify your email address and upload your resume:
          </div>
          <div class="otp-box">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0D9488; font-weight: 700; margin-bottom: 6px;">One-Time Verification Code</div>
            <div class="otp-code">{otp_code}</div>
          </div>
          <div class="text" style="font-size: 13px; color: #64748B;">
            ⚠️ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone. If you did not initiate this application, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          &copy; 2026 TalentBridge AI Recruitment Platform. All rights reserved.<br>
          Sent via Google SMTP Integration
        </div>
      </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.FROM_NAME} <{settings.SMTP_FROM}>"
        msg["To"] = to_email

        part_text = MIMEText(f"Hello {display_name},\n\nYour TalentBridge 6-digit verification code is: {otp_code}\nThis code expires in 10 minutes.", "plain")
        part_html = MIMEText(html_content, "html")

        msg.attach(part_text)
        msg.attach(part_html)

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Successfully sent OTP to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        return False


def send_stage_update_email(
    to_email: str,
    candidate_name: str,
    job_title: str,
    new_stage: str,
    notes: str = None
) -> bool:
    """
    Sends a real-time application status update email to the candidate
    whenever their stage changes in the Recruitment Pipeline Board.
    """
    display_name = candidate_name.strip() if candidate_name and candidate_name.strip() else "Candidate"
    
    # Configure subject and banner details based on new_stage
    stage_configs = {
        "Shortlisted": {
            "subject": f"🎉 Congratulations! You have been Shortlisted for {job_title}",
            "headline": "You've Been Shortlisted!",
            "badge_color": "#0D9488",
            "badge_bg": "#F0FDFA",
            "icon": "⭐",
            "message": f"Great news! Your profile and technical background have been reviewed and shortlisted by our hiring team for the position of <strong>{job_title}</strong>. We were very impressed with your resume."
        },
        "Interview Scheduled": {
            "subject": f"📅 Interview Scheduled: {job_title} at TalentBridge",
            "headline": "Interview Invitation",
            "badge_color": "#6366F1",
            "badge_bg": "#EEF2FF",
            "icon": "📅",
            "message": f"You have been invited for an interview for the <strong>{job_title}</strong> position! Please review the interview schedule and notes below."
        },
        "Interview Completed": {
            "subject": f"✅ Interview Completed - Evaluation in Progress: {job_title}",
            "headline": "Interview Completed",
            "badge_color": "#9333EA",
            "badge_bg": "#FAF5FF",
            "icon": "✅",
            "message": f"Thank you for attending the interview for <strong>{job_title}</strong>. Our interviewers are currently compiling evaluations and feedback."
        },
        "Selected": {
            "subject": f"🏆 Congratulations! Offer of Employment: {job_title}",
            "headline": "Job Offer / Candidate Selected",
            "badge_color": "#059669",
            "badge_bg": "#ECFDF5",
            "icon": "🏆",
            "message": f"We are thrilled to inform you that you have been <strong>Selected</strong> for the position of <strong>{job_title}</strong> at TalentBridge! Our HR team will reach out with your formal offer package."
        },
        "Not Selected": {
            "subject": f"Update regarding your application for {job_title}",
            "headline": "Application Status Update",
            "badge_color": "#DC2626",
            "badge_bg": "#FEF2F2",
            "icon": "📄",
            "message": f"Thank you for taking the time to apply for <strong>{job_title}</strong>. While we were impressed with your qualifications, we have decided to move forward with other candidates whose experience more closely matches our immediate technical needs."
        },
        "Resume Under Review": {
            "subject": f"Your Resume is Under Review for {job_title}",
            "headline": "Resume Under Review",
            "badge_color": "#2563EB",
            "badge_bg": "#EFF6FF",
            "icon": "🔍",
            "message": f"Your application and PDF resume for <strong>{job_title}</strong> are currently under active evaluation by our recruitment team."
        }
    }

    config = stage_configs.get(new_stage, {
        "subject": f"Application Status Update: {new_stage} for {job_title}",
        "headline": f"Status Update: {new_stage}",
        "badge_color": "#0B1528",
        "badge_bg": "#F1F5F9",
        "icon": "📌",
        "message": f"Your application for <strong>{job_title}</strong> has progressed to the <strong>{new_stage}</strong> stage."
    })

    subject = config["subject"]

    notes_html = ""
    if notes and notes.strip():
        notes_html = f"""
        <div style="background-color: #F8FAFC; border-left: 4px solid {config['badge_color']}; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Recruiter / Interview Details:</div>
          <div style="font-size: 14px; color: #1E293B; line-height: 1.6; white-space: pre-wrap;">{notes.strip()}</div>
        </div>
        """

    tracking_url = f"http://localhost:5173/track?email={to_email}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{subject}</title>
      <style>
        body {{
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #F4F7FB;
          margin: 0;
          padding: 24px;
        }}
        .container {{
          max-width: 560px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          border: 1px solid #E2E8F0;
        }}
        .header {{
          background: linear-gradient(135deg, #0B1528 0%, #16243D 100%);
          padding: 28px;
          text-align: center;
        }}
        .logo {{
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.5px;
        }}
        .logo span {{
          color: #00D2B4;
        }}
        .content {{
          padding: 32px 28px;
          color: #1F2937;
        }}
        .badge {{
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          background-color: {config['badge_bg']};
          color: {config['badge_color']};
          margin-bottom: 16px;
        }}
        .title {{
          font-size: 22px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 12px;
        }}
        .text {{
          font-size: 14.5px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 20px;
        }}
        .btn {{
          display: inline-block;
          background-color: #00A896;
          color: #FFFFFF !important;
          padding: 12px 26px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin: 12px 0 20px;
        }}
        .footer {{
          background-color: #F8FAFC;
          padding: 20px 28px;
          text-align: center;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #EDF2F7;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Talent<span>Bridge</span></div>
          <div style="color: #94A3B8; font-size: 12px; margin-top: 4px;">Recruitment Pipeline Notification</div>
        </div>
        <div class="content">
          <div class="badge">{config['icon']} Current Stage: {new_stage}</div>
          <div class="title">{config['headline']}</div>
          <div class="text">
            Dear <strong>{display_name}</strong>,<br><br>
            {config['message']}
          </div>

          {notes_html}

          <div style="text-align: center; margin: 24px 0;">
            <a href="{tracking_url}" class="btn">View Live Application Tracker &rarr;</a>
          </div>

          <div class="text" style="font-size: 12.5px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            Position: <strong>{job_title}</strong> &bull; TalentBridge Candidate Portal
          </div>
        </div>
        <div class="footer">
          &copy; 2026 TalentBridge AI Recruitment Platform. All rights reserved.<br>
          Sent via Automated Gmail SMTP Service
        </div>
      </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.FROM_NAME} <{settings.SMTP_FROM}>"
        msg["To"] = to_email

        plain_text = f"Hello {display_name},\n\nYour application for {job_title} has been updated to: {new_stage}.\n\n{config['message']}\n\nTrack your application: {tracking_url}"
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Successfully sent stage update email to {to_email} for stage {new_stage}")
        return True
    except Exception as e:
        logger.error(f"Failed to send stage update email to {to_email}: {e}")
        return False
