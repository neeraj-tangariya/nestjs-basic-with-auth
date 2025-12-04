import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Send OTP email to user
   * @param email - Recipient email address
   * @param otp - OTP code
   * @param firstName - User's first name
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    firstName: string,
  ): Promise<void> {
    const otpExpiryMinutes = 10; // You can make this configurable

    await this.sendEmail({
      to: email,
      subject: 'Your OTP for Email Verification',
      template: 'otp',
      context: {
        firstName,
        otp,
        expiryMinutes: otpExpiryMinutes,
      },
    });
  }

  /**
   * Generic reusable email sender
   * @param options - Email options
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error(`Failed to send email to ${options.to}:`, error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send welcome email (example of reusable function)
   * @param email - Recipient email address
   * @param firstName - User's first name
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Project Stark!',
      template: 'welcome',
      context: {
        firstName,
      },
    });
  }

  /**
   * Send password reset email (example of reusable function)
   * @param email - Recipient email address
   * @param resetToken - Password reset token
   * @param firstName - User's first name
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    firstName: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        firstName,
        resetUrl,
      },
    });
  }
}
