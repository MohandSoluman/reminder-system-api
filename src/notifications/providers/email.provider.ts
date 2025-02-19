/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Logger, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailtrapClient } from 'mailtrap';

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly transport: nodemailer.Transporter;
  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.transport = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 2525),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const sender = this.getSenderDetails();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await this.transport.sendMail({
        from: sender,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email frommethod--SMTP sent to: ${to}`);
    } catch (error) {
      this.logger.error('Error sending email SMTP:', error);
      throw error;
    }
  }

  private getSenderDetails() {
    return {
      email: this.configService.get<string>(
        'SENDEREMAIL',
        'DashReminderSystemApi@example.com',
      ),
      name: this.configService.get<string>(
        'SENDERNAME',
        'Dash Reminder System',
      ),
    };
  }

  //for testing
  async sendNotificationEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    try {
      const TOKEN = process.env['MAILTRAP_API_TOKEN'];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const client = new MailtrapClient({
        token: TOKEN || '05407a3ebcc64b7731fe027efd2bf537',
        testInboxId: Number(process.env['TESTINBOXID']) || 3313127,
      });

      const sender = {
        email:
          process.env['SENDEREMAIL'] || 'DashReminderSystemApi@example.com',
        name: process.env['SENDERNAME'] || 'Dash Reminder System',
      };
      const recipients = [
        {
          email: to,
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await client.testing
        .send({
          from: sender,
          to: recipients,
          subject: `${subject}`,
          html: html,
          text: text,
          category: 'Integration Test',
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .then(console.log, console.error);
      this.logger.log(`Email sent to ------------------->>>${to}`);
    } catch (error) {
      console.error('Error sending email method 2:', error);
    }
  }
}
