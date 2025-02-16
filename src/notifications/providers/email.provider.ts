/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
//import * as nodemailer from 'nodemailer';
import { MailtrapClient } from 'mailtrap';

@Injectable()
export class EmailProvider {
  constructor() {
    // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    // this.transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env['SMTP_USER'],
    //     pass: process.env['SMTP_PASS'],
    //   },
    // });
  }

  // async sendEmail(
  //   to: string,
  //   subject: string,
  //   text: string,
  //   html?: string,
  // ): Promise<void> {
  //   const mailOptions = {
  //     from: process.env['SMTP_USER'],
  //     to,
  //     subject,
  //     text,
  //     html,
  //   };

  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  //     await this.transporter.sendMail(mailOptions);
  //     console.log('Email sent successfully');
  //   } catch (error) {
  //     console.error('Error sending email:', error);
  //   }
  // }

  sendNotificationEmail(
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
      client.testing
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
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
