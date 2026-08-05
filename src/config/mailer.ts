import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const { MAIL_USER, MAIL_APP_PASSWORD } = process.env;
if (!MAIL_USER || !MAIL_APP_PASSWORD) {
  throw new Error('MAIL_USER et MAIL_APP_PASSWORD sont requis dans .env');
}

export const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: { user: MAIL_USER, pass: MAIL_APP_PASSWORD },
});
