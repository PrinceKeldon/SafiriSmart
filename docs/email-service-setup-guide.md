
# Email Service Setup Guide - TourMaster AI

This guide explains how to configure email notifications for the TourMaster AI (B2B) Backend using SendGrid as the primary email service provider.

## Overview

The email service supports two providers:
1. **SendGrid** (Recommended) - API-based email service
2. **SMTP** - Fallback for other email providers

## SendGrid Setup (Recommended)

### Step 1: Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/) and sign up for a free account
2. Verify your email address
3. Complete the account setup process

### Step 2: Domain Authentication (Important)
1. In the SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the instructions to add DNS records to your domain
4. Wait for verification (this can take up to 48 hours)

**Note:** Domain authentication is required to avoid emails being marked as spam.

### Step 3: Create API Key
1. In the SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Give it a name like "TourMaster AI Backend"
5. Grant the following permissions:
   - **Mail Send**: Full Access
   - **Mail Settings**: Read Access (optional)
6. Copy the generated API key (you won't see it again!)

### Step 4: Configure Environment Variables
Update your `.env` file with your SendGrid credentials:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=notifications@yourdomain.com
SENDGRID_FROM_NAME=TourMaster AI

# Email Mode
EMAIL_MODE=production
```

**Important:** 
- Replace `notifications@yourdomain.com` with an email address from your verified domain
- Use the domain you authenticated in Step 2

## Alternative SMTP Setup

If you prefer to use a different email provider, configure the SMTP settings:

```bash
# SMTP Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-app-password
EMAIL_USE_TLS=true

# Disable SendGrid
SENDGRID_API_KEY=
```

### Common SMTP Providers:

#### Gmail
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password  # Generate in Google Account settings
EMAIL_USE_TLS=true
```

#### Outlook/Office 365
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_USE_TLS=true
```

## Development Mode

For testing and development, you can set the email service to log mode:

```bash
EMAIL_MODE=development
```

This will log email content to the console instead of actually sending emails.

## Testing Email Configuration

### Method 1: API Endpoint
You can test the email configuration using the health check endpoint:

```bash
curl -X GET http://localhost:8001/health/email
```

### Method 2: Python Script
Create a test script to verify email sending:

```python
import os
import sys
sys.path.append('.')
from email_service import email_service

# Test email configuration
status = email_service.test_email_configuration()
print(f"Email Service Status: {status}")

# Test sending an email (optional)
if status['configured']:
    test_email = "test@example.com"
    success = email_service._send_email(
        test_email,
        "Test Email",
        "This is a test email from TourMaster AI."
    )
    print(f"Test email sent: {success}")
```

## Email Templates

The email service includes professionally designed HTML templates for:

1. **New Lead Notifications** - Sent to tour operators
2. **Itinerary Emails** - Sent to travelers

Both templates include:
- Responsive design
- Professional styling
- Clear call-to-action buttons
- Fallback plain text versions

## Troubleshooting

### Common Issues

1. **Emails going to spam**
   - Ensure domain authentication is completed
   - Use a verified sender email address
   - Check your domain's SPF/DKIM records

2. **SendGrid API errors**
   - Verify API key permissions
   - Check API key hasn't expired
   - Ensure sufficient email credits

3. **SMTP authentication failures**
   - Use app-specific passwords for Gmail
   - Check firewall settings
   - Verify SMTP credentials

### Error Codes

- **401 Unauthorized**: Invalid API key or SMTP credentials
- **403 Forbidden**: Insufficient permissions or unverified domain
- **429 Rate Limited**: Too many emails sent (upgrade plan)
- **500 Server Error**: Check service status

## Monitoring and Logs

Email sending is logged at various levels:
- **INFO**: Successful email sending
- **WARNING**: Configuration issues
- **ERROR**: Failed email attempts

Check your application logs for email-related messages:

```bash
# View recent logs
docker logs tourmaster-b2b-backend | grep -i email

# Real-time monitoring
docker logs -f tourmaster-b2b-backend | grep -i email
```

## Production Considerations

1. **Volume Limits**: Check your SendGrid plan limits
2. **Rate Limiting**: Implement delays for bulk emails if needed
3. **Monitoring**: Set up alerts for failed email deliveries
4. **Backup Provider**: Configure SMTP as fallback
5. **Analytics**: Use SendGrid's analytics to track email performance

## Security Best Practices

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Use restricted access keys

2. **Email Content**:
   - Sanitize user-generated content
   - Use parameterized templates
   - Validate email addresses

3. **Domain Security**:
   - Enable DMARC policies
   - Monitor domain reputation
   - Use dedicated sending domains

## Support

- **SendGrid Support**: [SendGrid Help Center](https://docs.sendgrid.com/)
- **API Documentation**: [SendGrid API Docs](https://docs.sendgrid.com/api-reference)
- **Status Page**: [SendGrid Status](https://status.sendgrid.com/)

For TourMaster AI specific issues, check the application logs and ensure all environment variables are correctly configured.
