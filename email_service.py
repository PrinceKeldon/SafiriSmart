
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "notifications@yourcompany.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "app-password")

class EmailService:
    def __init__(self):
        self.host = EMAIL_HOST
        self.port = EMAIL_PORT
        self.user = EMAIL_USER
        self.password = EMAIL_PASSWORD
    
    def send_new_lead_notification(self, operator_email: str, operator_name: str, lead_data: dict) -> bool:
        """Send email notification to operator about new lead"""
        try:
            subject = f"New Lead Assigned: {lead_data['traveler_name']}"
            
            body = f"""
            Dear {operator_name},

            A new lead has been assigned to you:

            Traveler: {lead_data['traveler_name']}
            Email: {lead_data['traveler_email']}
            Phone: {lead_data.get('traveler_phone', 'Not provided')}
            Country: {lead_data.get('traveler_country', 'Not provided')}

            Trip Details:
            - Duration: {lead_data['preferences'].get('duration', 'Not specified')} days
            - Budget: {lead_data['preferences'].get('budgetRange', 'Not specified')}
            - Group Size: {lead_data['preferences'].get('groupSize', 'Not specified')}
            - Interests: {', '.join(lead_data['preferences'].get('interests', []))}

            Please log into your TourMaster dashboard to view the complete itinerary and contact the customer.

            Best regards,
            TourMaster AI Team
            """
            
            return self._send_email(operator_email, subject, body)
        
        except Exception as e:
            logger.error(f"Error sending new lead notification: {str(e)}")
            return False
    
    def _send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Internal method to send email"""
        try:
            # For MVP, we'll log the email instead of actually sending it
            # In production, uncomment the SMTP code below
            
            logger.info(f"Email would be sent to: {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {body}")
            
            # Uncomment for actual email sending:
            """
            msg = MIMEMultipart()
            msg['From'] = self.user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.host, self.port)
            server.starttls()
            server.login(self.user, self.password)
            text = msg.as_string()
            server.sendmail(self.user, to_email, text)
            server.quit()
            """
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

# Global email service instance
email_service = EmailService()
