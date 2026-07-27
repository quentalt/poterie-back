import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL ?? SMTP_USER ?? 'no-reply@example.com';
const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:3000';

function createTransport() {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('Configuration SMTP manquante. Vérifiez SMTP_USER et SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const transporter = createTransport();
  const resetLink = `${APP_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    text: `Bonjour,\n\nVous avez demandé une réinitialisation de mot de passe.\nCliquez sur le lien ci-dessous pour définir un nouveau mot de passe :\n${resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Ce lien expirera dans 15 minutes.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      </div>
    `,
  });
}
