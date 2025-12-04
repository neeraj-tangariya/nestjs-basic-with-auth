# Gmail App Password Setup Guide

## Step-by-Step Instructions

Follow these steps to generate a Gmail App Password for your email service:

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", click on **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to **Security**
2. Under "How you sign in to Google", click on **2-Step Verification**
3. Scroll down to the bottom and click on **App passwords**
4. You may need to sign in again
5. In the "Select app" dropdown, choose **Mail**
6. In the "Select device" dropdown, choose **Other (Custom name)**
7. Enter a name like "NestJS Project Stark"
8. Click **Generate**
9. Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`)
10. **Copy this password** - you won't be able to see it again!

### Step 3: Update Your .env File

Open your `.env` file and update these values:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-actual-email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop  # Paste the 16-character app password (remove spaces)
MAIL_FROM=your-actual-email@gmail.com
```

**Important Notes:**

- Remove all spaces from the app password when pasting
- Use your actual Gmail address for `MAIL_USER` and `MAIL_FROM`
- The app password is different from your regular Gmail password

### Step 4: Restart Your Server

After updating the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run start:dev
```

### Step 5: Test Email Sending

1. Use Swagger UI at `http://localhost:3000/api`
2. Test the `/auth/signup` endpoint
3. Check your Gmail inbox for the OTP email

## Troubleshooting

### "Invalid credentials" error

- Double-check the app password (no spaces)
- Make sure you're using the app password, not your regular password
- Verify 2-Step Verification is enabled

### "Less secure app access" error

- This shouldn't happen with app passwords
- If it does, enable "Less secure app access" in Google Account settings
- Better solution: Use app passwords (recommended)

### Emails not arriving

- Check spam/junk folder
- Verify `MAIL_FROM` matches `MAIL_USER`
- Check server logs for error messages

## Alternative: Use Mailtrap for Testing

If you want to test without using your real Gmail:

1. Sign up at https://mailtrap.io (free)
2. Get test SMTP credentials
3. Update `.env`:

```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_FROM=noreply@projectstark.com
```

All emails will be caught in Mailtrap's inbox - perfect for testing!

## Security Tips

✅ Never commit `.env` file to Git (already in `.gitignore`)
✅ Use app passwords instead of your main password
✅ Revoke app passwords you're not using
✅ Consider using environment-specific email services in production (SendGrid, AWS SES)
