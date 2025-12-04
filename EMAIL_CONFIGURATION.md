# Email Service Configuration Guide

## Quick Setup

To enable email sending, you need to configure SMTP settings in your `.env` file.

## Option 1: Mailtrap (Recommended for Development/Testing)

Mailtrap catches all emails in a test inbox - perfect for development!

1. Sign up at [mailtrap.io](https://mailtrap.io) (free)
2. Create an inbox
3. Copy SMTP credentials
4. Add to `.env`:

```env
# Email Configuration
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_FROM=noreply@projectstark.com
```

## Option 2: Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Add to `.env`:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
```

## Option 3: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to `.env`:

```env
# Email Configuration
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_FROM=your-verified-sender@yourdomain.com
```

## Testing

After configuration:

1. Restart your server
2. Test signup endpoint - you should receive OTP email
3. Check your email inbox (or Mailtrap inbox)

## Troubleshooting

**Emails not sending?**

- Check SMTP credentials are correct
- Verify port number (587 for TLS, 465 for SSL)
- Check firewall/network settings
- Look at server logs for error messages

**Using Gmail and getting errors?**

- Make sure 2FA is enabled
- Use App Password, not your regular password
- Enable "Less secure app access" if needed
