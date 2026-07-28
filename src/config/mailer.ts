import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error('GMAIL_USER et GMAIL_APP_PASSWORD sont requis dans .env');
}

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});
