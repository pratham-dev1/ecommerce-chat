import nodemailer from "nodemailer";

import { env } from "../../config/env";

type SendMailInput = {
  html?: string;
  subject: string;
  text: string;
  to: string;
};

export class MailerService {
  private readonly transporter = nodemailer.createTransport({
    auth: {
      pass: env.smtpPass,
      user: env.smtpUser,
    },
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
  });

  // Throws on failure so callers (e.g. the BullMQ worker) can retry instead of silently dropping the email.
  async sendMail(input: SendMailInput) {
    await this.transporter.sendMail({
      from: env.smtpFrom,
      html: input.html,
      subject: input.subject,
      text: input.text,
      to: input.to,
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("SMTP connection verified");
      return true;
    } catch (error) {
      console.warn("SMTP verification failed; daily emails will not be sent", error);
      return false;
    }
  }
}
