import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const { HOTMAIL_USER, HOTMAIL_APP_PASSWORD } = process.env;
if (!HOTMAIL_USER || !HOTMAIL_APP_PASSWORD) {
  throw new Error('GMAIL_USER et GMAIL_APP_PASSWORD sont requis dans .env');
}

export const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: { user: HOTMAIL_USER, pass: HOTMAIL_APP_PASSWORD },
});
