/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
//import * as nodemailer from 'nodemailer';
import { MailtrapClient } from 'mailtrap';
import { Nodemailer } from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

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

  sendEmail(to: string, subject: string, text: string, html?: string): void {
    const TOKEN = '05407a3ebcc64b7731fe027efd2bf537';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const transport = Nodemailer.createTransport(
      MailtrapTransport({
        token: TOKEN,
        testInboxId: 3313127,
      }),
    );

    const sender = {
      address: 'hello@example.com',
      name: 'Mailtrap Test',
    };

    transport
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .sendMail({
        from: sender,
        to: to,
        subject: subject,
        text: text,
        category: html,
        sandbox: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .catch((error) => {
        console.error('Error sending email:', error);
      });
  }

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
