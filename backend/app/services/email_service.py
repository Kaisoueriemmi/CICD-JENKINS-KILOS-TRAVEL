"""
Email Service for AirWeight
Handles email sending for verification, password reset, and notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails"""

    def __init__(self):
        """Initialize email service with SMTP configuration"""
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', None)
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
        self.from_email = getattr(settings, 'FROM_EMAIL', self.smtp_user)
        self.from_name = getattr(settings, 'FROM_NAME', 'AirWeight')

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (fallback)

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not self.smtp_user or not self.smtp_password:
            logger.warning("SMTP credentials not configured. Email not sent.")
            return False

        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email

            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, 'plain')
                msg.attach(part1)

            part2 = MIMEText(html_content, 'html')
            msg.attach(part2)

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    def send_verification_email(self, to_email: str, verification_token: str, user_name: str) -> bool:
        """
        Send email verification email

        Args:
            to_email: User's email address
            verification_token: Verification token
            user_name: User's name

        Returns:
            True if email was sent successfully
        """
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"

        subject = "Verify your AirWeight account"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✈️ Welcome to AirWeight!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Thank you for signing up! Please verify your email address to get started with AirWeight.</p>
                    <p>Click the button below to verify your account:</p>
                    <p style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{verification_url}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2026 AirWeight. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Welcome to AirWeight!

        Hi {user_name},

        Thank you for signing up! Please verify your email address by clicking the link below:

        {verification_url}

        This link will expire in 24 hours.

        If you didn't create an account, you can safely ignore this email.

        © 2026 AirWeight. All rights reserved.
        """

        return self.send_email(to_email, subject, html_content, text_content)

    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str) -> bool:
        """
        Send password reset email

        Args:
            to_email: User's email address
            reset_token: Password reset token
            user_name: User's name

        Returns:
            True if email was sent successfully
        """
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        subject = "Reset your AirWeight password"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>We received a request to reset your password for your AirWeight account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{reset_url}</p>
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your password will remain unchanged until you create a new one</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2026 AirWeight. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Password Reset Request

        Hi {user_name},

        We received a request to reset your password for your AirWeight account.

        Click the link below to reset your password:

        {reset_url}

        This link will expire in 1 hour.

        If you didn't request this reset, please ignore this email. Your password will remain unchanged.

        © 2026 AirWeight. All rights reserved.
        """

        return self.send_email(to_email, subject, html_content, text_content)

    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """
        Send welcome email after successful verification

        Args:
            to_email: User's email address
            user_name: User's name

        Returns:
            True if email was sent successfully
        """
        subject = "Welcome to AirWeight! 🎉"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to AirWeight!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Your account is now verified and ready to use! Start turning your unused baggage allowance into valuable credits.</p>

                    <h3>🚀 Get Started:</h3>
                    <div class="feature">
                        <strong>1. Add Your First Flight</strong><br>
                        Upload your boarding pass or enter flight details manually
                    </div>
                    <div class="feature">
                        <strong>2. Earn Credits</strong><br>
                        Get credits for every kg of unused baggage allowance
                    </div>
                    <div class="feature">
                        <strong>3. Use Your Credits</strong><br>
                        Transfer credits to others or save for future flights
                    </div>

                    <p style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
                    </p>

                    <p>Need help? Check out our <a href="{settings.FRONTEND_URL}/help">Help Center</a> or reply to this email.</p>
                </div>
                <div class="footer">
                    <p>© 2026 AirWeight. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Welcome to AirWeight!

        Hi {user_name},

        Your account is now verified and ready to use! Start turning your unused baggage allowance into valuable credits.

        Get Started:
        1. Add Your First Flight - Upload your boarding pass or enter flight details manually
        2. Earn Credits - Get credits for every kg of unused baggage allowance
        3. Use Your Credits - Transfer credits to others or save for future flights

        Visit your dashboard: {settings.FRONTEND_URL}/dashboard

        Need help? Check out our Help Center or reply to this email.

        © 2026 AirWeight. All rights reserved.
        """

        return self.send_email(to_email, subject, html_content, text_content)


# Dependency for FastAPI
def get_email_service() -> EmailService:
    """Dependency to get email service instance"""
    return EmailService()
