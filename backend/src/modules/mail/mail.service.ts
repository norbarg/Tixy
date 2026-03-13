import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendTicketEmail(params: {
    to: string;
    userLogin: string;
    eventTitle: string;
    orderId: string;
    attachments: { filename: string; content: Buffer; contentType: string }[];
  }) {
    const { to, userLogin, eventTitle, orderId, attachments } = params;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `Your Tixy ticket for ${eventTitle}`,
      text: [
        `Hello, ${userLogin}!`,
        '',
        `Your payment for "${eventTitle}" was successful.`,
        'Your ticket(s) are attached to this email as PDF files.',
        '',
        `Order ID: ${orderId}`,
        '',
        'Thank you for using Tixy!',
      ].join('\n'),
      attachments,
    });
  }
}
