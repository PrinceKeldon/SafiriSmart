
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
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
    
    def send_itinerary_email(self, traveler_email: str, traveler_name: str, itinerary: Dict[str, Any], operator_name: str, company_name: str) -> bool:
        """Send itinerary to traveler"""
        try:
            subject = f"Your Safari Itinerary: {itinerary.get('title', 'Safari Adventure')}"
            
            # Build itinerary HTML
            itinerary_html = self._build_itinerary_html(itinerary)
            
            body = f"""
            Dear {traveler_name},

            We're excited to share your personalized safari itinerary!

            {itinerary_html}

            If you have any questions or would like to make modifications, please don't hesitate to contact us.

            Best regards,
            {operator_name}
            {company_name}
            """
            
            return self._send_email(traveler_email, subject, body)
        
        except Exception as e:
            logger.error(f"Error sending itinerary email: {str(e)}")
            return False
    
    def _build_itinerary_html(self, itinerary: Dict[str, Any]) -> str:
        """Build HTML representation of itinerary"""
        try:
            html = f"""
            <h2>{itinerary.get('title', 'Safari Adventure')}</h2>
            <p>{itinerary.get('overview', '')}</p>
            
            <h3>Trip Overview</h3>
            <ul>
                <li>Duration: {itinerary.get('totalDuration', 'N/A')} days</li>
                <li>Estimated Cost: {itinerary.get('estimatedCost', {}).get('amount', 'N/A')} {itinerary.get('estimatedCost', {}).get('currency', 'USD')}</li>
            </ul>
            
            <h3>Daily Itinerary</h3>
            """
            
            for day in itinerary.get('days', []):
                html += f"""
                <h4>Day {day.get('day', 'N/A')} - {day.get('location', 'Location')}</h4>
                <p><strong>Accommodation:</strong> {day.get('accommodation', {}).get('name', 'N/A')}</p>
                <p><strong>Activities:</strong></p>
                <ul>
                """
                
                for activity in day.get('activities', []):
                    html += f"<li>{activity.get('name', 'Activity')} - {activity.get('description', '')}</li>"
                
                html += f"""
                </ul>
                <p><strong>Meals:</strong> {', '.join(day.get('meals', []))}</p>
                <p><strong>Transport:</strong> {day.get('transport', 'N/A')}</p>
                """
                
                if day.get('notes'):
                    html += f"<p><strong>Notes:</strong> {day.get('notes')}</p>"
                
                html += "<hr>"
            
            return html
        
        except Exception as e:
            logger.error(f"Error building itinerary HTML: {str(e)}")
            return "Itinerary details unavailable"
    
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
            
            msg.attach(MIMEText(body, 'html'))
            
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
