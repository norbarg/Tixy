//src/modules/mail/mail.service.ts
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
  async sendSimpleEmail(params: { to: string; subject: string; text: string }) {
    const { to, subject, text } = params;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });
  }

  async sendCompanyNewsEmail(params: {
    to: string;
    userLogin: string;
    companyName: string;
    newsTitle: string;
    newsContent: string;
  }) {
    const { to, userLogin, companyName, newsTitle, newsContent } = params;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `${companyName}: ${newsTitle}`,
      text: [
        `Hello, ${userLogin}!`,
        '',
        `There is a new update from "${companyName}".`,
        '',
        `Title: ${newsTitle}`,
        '',
        newsContent,
        '',
        'Thank you for using Tixy!',
      ].join('\n'),
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
