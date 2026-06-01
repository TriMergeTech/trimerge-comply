import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get('SMTP_HOST');
    const port = this.config.get('SMTP_PORT');

    if (host && port) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: parseInt(port, 10) === 465,
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASS'),
        },
      });
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const from = this.config.get('MAIL_FROM') || 'noreply@example.com';

    if (!this.transporter) {
      this.logger.warn(`[DEV MODE] Verification code for ${email}: ${code}`);
      return;
    }

    await this.transporter.sendMail({
      from,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Account</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold;">
            ${code}
          </div>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${email}`);
  }
}
