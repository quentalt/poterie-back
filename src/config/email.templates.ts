/**
 * Email avec le code à 6 chiffres à recopier dans le front.
 */
export function resetCodeTemplate(params: {
  username: string;
  code: string;         // ex: "482 913"
  expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
  const { username, code, expiresInMinutes } = params;
  const subject = `Votre code de réinitialisation : ${code}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 2px 10px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:28px 40px;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;
                        letter-spacing:2px;text-transform:uppercase;">
                Mot de passe oublié
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 16px;">
              <p style="margin:0 0 8px;color:#3f3f46;font-size:15px;line-height:1.6;">
                Bonjour <strong>${username}</strong>,
              </p>
              <p style="margin:0 0 32px;color:#71717a;font-size:14px;line-height:1.6;">
                Utilisez le code ci-dessous pour réinitialiser votre mot de passe.
              </p>
            </td>
          </tr>

          <!-- Code block -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#f4f4f5;border-radius:8px;padding:28px;
                          text-align:center;">
                <p style="margin:0 0 8px;color:#71717a;font-size:12px;
                           letter-spacing:1.5px;text-transform:uppercase;">
                  Votre code
                </p>
                <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;
                           color:#18181b;font-family:'Courier New',monospace;">
                  ${code}
                </p>
              </div>
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#71717a;font-size:13px;">
                ⏱ Ce code expire dans <strong>${expiresInMinutes} minutes</strong>.
              </p>
              <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.6;">
                Si vous n'avez pas demandé cette réinitialisation,<br />
                ignorez cet email — votre mot de passe reste inchangé.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text =
    `Bonjour ${username},\n\n` +
    `Votre code de réinitialisation : ${code}\n\n` +
    `Ce code expire dans ${expiresInMinutes} minutes.\n\n` +
    `Si vous n'avez pas fait cette demande, ignorez cet email.`;

  return { subject, html, text };
}

/**
 * Email de confirmation après changement réussi.
 */
export function passwordChangedTemplate(params: {
  username: string;
}): { subject: string; html: string; text: string } {
  const { username } = params;
  const subject = 'Votre mot de passe a été modifié';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 2px 10px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#18181b;padding:28px 40px;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;
                        letter-spacing:2px;text-transform:uppercase;">
                ✅ Mot de passe modifié
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
                Bonjour <strong>${username}</strong>,
              </p>
              <p style="margin:0;color:#71717a;font-size:14px;line-height:1.6;">
                Votre mot de passe a bien été mis à jour. Vous pouvez maintenant
                vous connecter avec votre nouveau mot de passe.<br /><br />
                Si vous n'êtes pas à l'origine de ce changement, contactez-nous
                immédiatement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text =
    `Bonjour ${username},\n\n` +
    `Votre mot de passe a bien été modifié.\n` +
    `Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.`;

  return { subject, html, text };
}
