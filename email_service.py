
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import logging

# SendGrid integration
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, From, To, Subject, PlainTextContent, HtmlContent
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False
    logging.warning("SendGrid library not installed. Email will be logged only.")

load_dotenv()

logger = logging.getLogger(__name__)

# Email configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "notifications@tourmaster.ai")
SENDGRID_FROM_NAME = os.getenv("SENDGRID_FROM_NAME", "TourMaster AI")

# Fallback SMTP configuration for non-SendGrid providers
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "notifications@yourcompany.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "app-password")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"

class EmailService:
    def __init__(self):
        self.sendgrid_client = None
        self.use_sendgrid = False
        
        # Initialize SendGrid if available and configured
        if SENDGRID_AVAILABLE and SENDGRID_API_KEY:
            try:
                self.sendgrid_client = SendGridAPIClient(api_key=SENDGRID_API_KEY)
                self.use_sendgrid = True
                logger.info("SendGrid email service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize SendGrid: {str(e)}")
                self.use_sendgrid = False
        
        # Fallback to SMTP configuration
        if not self.use_sendgrid:
            self.host = EMAIL_HOST
            self.port = EMAIL_PORT
            self.user = EMAIL_USER
            self.password = EMAIL_PASSWORD
            self.use_tls = EMAIL_USE_TLS
            logger.info(f"Using SMTP email service: {self.host}:{self.port}")
    
    def send_new_lead_notification(self, operator_email: str, operator_name: str, lead_data: dict) -> bool:
        """Send email notification to operator about new lead"""
        try:
            subject = f"New Lead Assigned: {lead_data['traveler_name']}"
            
            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; }}
                    .lead-details {{ background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }}
                    .footer {{ text-align: center; padding: 20px; color: #666; }}
                    .button {{ background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Lead Assignment</h1>
                    </div>
                    <div class="content">
                        <h2>Dear {operator_name},</h2>
                        <p>A new lead has been assigned to you through TourMaster AI.</p>
                        
                        <div class="lead-details">
                            <h3>Traveler Information</h3>
                            <p><strong>Name:</strong> {lead_data['traveler_name']}</p>
                            <p><strong>Email:</strong> {lead_data['traveler_email']}</p>
                            <p><strong>Phone:</strong> {lead_data.get('traveler_phone', 'Not provided')}</p>
                            <p><strong>Country:</strong> {lead_data.get('traveler_country', 'Not provided')}</p>
                        </div>
                        
                        <div class="lead-details">
                            <h3>Trip Preferences</h3>
                            <p><strong>Duration:</strong> {lead_data['preferences'].get('duration', 'Not specified')} days</p>
                            <p><strong>Budget:</strong> {lead_data['preferences'].get('budgetRange', 'Not specified')}</p>
                            <p><strong>Group Size:</strong> {lead_data['preferences'].get('groupSize', 'Not specified')}</p>
                            <p><strong>Interests:</strong> {', '.join(lead_data['preferences'].get('interests', []))}</p>
                        </div>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="https://dashboard.tourmaster.ai/leads" class="button">View Lead Details</a>
                        </p>
                        
                        <p>Please log into your TourMaster dashboard to view the complete itinerary and contact the customer.</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>TourMaster AI Team</p>
                        <p style="font-size: 12px; color: #999;">
                            This email was sent automatically. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            plain_text = f"""
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
            
            return self._send_email(operator_email, subject, plain_text, html_content)
        
        except Exception as e:
            logger.error(f"Error sending new lead notification: {str(e)}")
            return False
    
    def send_itinerary_email(self, traveler_email: str, traveler_name: str, itinerary: Dict[str, Any], operator_name: str, company_name: str) -> bool:
        """Send itinerary to traveler"""
        try:
            subject = f"Your Safari Itinerary: {itinerary.get('title', 'Safari Adventure')}"
            
            # Build itinerary HTML
            itinerary_html = self._build_itinerary_html(itinerary)
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #059669; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .itinerary {{ background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 5px; }}
                    .day {{ margin: 15px 0; padding: 15px; background-color: white; border-radius: 5px; }}
                    .footer {{ text-align: center; padding: 20px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Your Safari Itinerary</h1>
                    </div>
                    <div class="content">
                        <h2>Dear {traveler_name},</h2>
                        <p>We're excited to share your personalized safari itinerary!</p>
                        
                        <div class="itinerary">
                            {itinerary_html}
                        </div>
                        
                        <p>If you have any questions or would like to make modifications, please don't hesitate to contact us.</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>{operator_name}<br>{company_name}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            plain_text = f"""
            Dear {traveler_name},

            We're excited to share your personalized safari itinerary!

            {self._build_itinerary_text(itinerary)}

            If you have any questions or would like to make modifications, please don't hesitate to contact us.

            Best regards,
            {operator_name}
            {company_name}
            """
            
            return self._send_email(traveler_email, subject, plain_text, html_content)
        
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
                <div class="day">
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
                
                html += "</div>"
            
            return html
        
        except Exception as e:
            logger.error(f"Error building itinerary HTML: {str(e)}")
            return "Itinerary details unavailable"
    
    def _build_itinerary_text(self, itinerary: Dict[str, Any]) -> str:
        """Build text representation of itinerary"""
        try:
            text = f"""
{itinerary.get('title', 'Safari Adventure')}
{itinerary.get('overview', '')}

Trip Overview:
- Duration: {itinerary.get('totalDuration', 'N/A')} days
- Estimated Cost: {itinerary.get('estimatedCost', {}).get('amount', 'N/A')} {itinerary.get('estimatedCost', {}).get('currency', 'USD')}

Daily Itinerary:
"""
            
            for day in itinerary.get('days', []):
                text += f"""
Day {day.get('day', 'N/A')} - {day.get('location', 'Location')}
Accommodation: {day.get('accommodation', {}).get('name', 'N/A')}
Activities: {', '.join([activity.get('name', 'Activity') for activity in day.get('activities', [])])}
Meals: {', '.join(day.get('meals', []))}
Transport: {day.get('transport', 'N/A')}
"""
                if day.get('notes'):
                    text += f"Notes: {day.get('notes')}\n"
                text += "---\n"
            
            return text
        
        except Exception as e:
            logger.error(f"Error building itinerary text: {str(e)}")
            return "Itinerary details unavailable"
    
    def _send_email_sendgrid(self, to_email: str, subject: str, plain_text: str, html_content: str) -> bool:
        """Send email using SendGrid API"""
        try:
            message = Mail(
                from_email=From(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
                to_emails=To(to_email),
                subject=Subject(subject),
                plain_text_content=PlainTextContent(plain_text),
                html_content=HtmlContent(html_content)
            )
            
            response = self.sendgrid_client.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully via SendGrid to {to_email}")
                return True
            else:
                logger.error(f"SendGrid API error: {response.status_code}, {response.body}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending email via SendGrid: {str(e)}")
            return False
    
    def _send_email_smtp(self, to_email: str, subject: str, plain_text: str, html_content: str) -> bool:
        """Send email using SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add both plain text and HTML versions
            part1 = MIMEText(plain_text, 'plain')
            part2 = MIMEText(html_content, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            server = smtplib.SMTP(self.host, self.port)
            if self.use_tls:
                server.starttls()
            server.login(self.user, self.password)
            text = msg.as_string()
            server.sendmail(self.user, to_email, text)
            server.quit()
            
            logger.info(f"Email sent successfully via SMTP to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email via SMTP: {str(e)}")
            return False
    
    def _send_email(self, to_email: str, subject: str, plain_text: str, html_content: str = None) -> bool:
        """Internal method to send email using the configured provider"""
        
        # For development/testing, log the email instead of sending
        if os.getenv("EMAIL_MODE", "production").lower() == "development":
            logger.info(f"[DEVELOPMENT MODE] Email would be sent to: {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {plain_text}")
            return True
        
        # Use SendGrid if available
        if self.use_sendgrid:
            return self._send_email_sendgrid(to_email, subject, plain_text, html_content or plain_text)
        
        # Fallback to SMTP
        return self._send_email_smtp(to_email, subject, plain_text, html_content or plain_text)
    
    def test_email_configuration(self) -> Dict[str, Any]:
        """Test email configuration and return status"""
        status = {
            "provider": "SendGrid" if self.use_sendgrid else "SMTP",
            "configured": False,
            "error": None
        }
        
        try:
            if self.use_sendgrid:
                # Test SendGrid configuration
                status["configured"] = bool(SENDGRID_API_KEY and self.sendgrid_client)
                if not status["configured"]:
                    status["error"] = "SendGrid API key not configured"
            else:
                # Test SMTP configuration
                status["configured"] = bool(self.host and self.user and self.password)
                if not status["configured"]:
                    status["error"] = "SMTP credentials not configured"
                    
        except Exception as e:
            status["error"] = str(e)
            
        return status

# Global email service instance
email_service = EmailService()
