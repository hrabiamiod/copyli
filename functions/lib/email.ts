// Wysylka maili przez Resend API
// Docs: https://resend.com/docs/api-reference/emails/send-email

const FROM = 'CoPyli <noreply@copyli.pl>';
const RESEND_API = 'https://api.resend.com/emails';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(apiKey: string, opts: SendEmailOptions): Promise<boolean> {
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendVerificationEmail(
  apiKey: string,
  to: string,
  name: string | null,
  token: string,
  appUrl: string
): Promise<boolean> {
  const link = `${appUrl}/weryfikacja-email?token=${token}`;
  const greeting = name ? `Cześć ${name}` : 'Cześć';

  return sendEmail(apiKey, {
    to,
    subject: 'Potwierdź adres email — CoPyli',
    html: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#2d6a4f;padding:32px 40px;text-align:center">
          <span style="font-size:28px">🌿</span>
          <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700">CoPyli</h1>
          <p style="margin:4px 0 0;color:#95d5b2;font-size:13px">Mapa pylenia Polski</p>
        </td></tr>
        <tr><td style="padding:40px">
          <h2 style="margin:0 0 16px;color:#1b4332;font-size:20px">${greeting}!</h2>
          <p style="margin:0 0 24px;color:#374151;line-height:1.6">
            Dziękujemy za rejestrację w CoPyli. Kliknij przycisk poniżej, aby potwierdzić swój adres email.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${link}" style="background:#2d6a4f;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block">
              Potwierdź email
            </a>
          </div>
          <p style="margin:24px 0 0;color:#6b7280;font-size:13px">
            Link wygasa za 24 godziny. Jeśli nie zakładałeś konta w CoPyli, zignoruj tę wiadomość.
          </p>
          <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;word-break:break-all">
            Lub skopiuj: ${link}
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">© 2026 CoPyli.pl — Mapa pylenia dla alergików</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(
  apiKey: string,
  to: string,
  name: string | null,
  token: string,
  appUrl: string
): Promise<boolean> {
  const link = `${appUrl}/resetuj-haslo?token=${token}`;
  const greeting = name ? `Cześć ${name}` : 'Cześć';

  return sendEmail(apiKey, {
    to,
    subject: 'Reset hasła — CoPyli',
    html: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#2d6a4f;padding:32px 40px;text-align:center">
          <span style="font-size:28px">🌿</span>
          <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700">CoPyli</h1>
        </td></tr>
        <tr><td style="padding:40px">
          <h2 style="margin:0 0 16px;color:#1b4332;font-size:20px">${greeting}, resetujesz hasło</h2>
          <p style="margin:0 0 24px;color:#374151;line-height:1.6">
            Otrzymaliśmy prośbę o reset hasła do Twojego konta CoPyli. Kliknij poniżej, aby ustawić nowe hasło.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${link}" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block">
              Resetuj hasło
            </a>
          </div>
          <p style="margin:24px 0 0;color:#6b7280;font-size:13px">
            Link wygasa za <strong>1 godzinę</strong>. Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość — Twoje konto jest bezpieczne.
          </p>
          <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;word-break:break-all">
            Lub skopiuj: ${link}
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">© 2026 CoPyli.pl</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

const LEVEL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: 'Niskie',          color: '#2D6A4F', bg: 'rgba(82,183,136,0.15)' },
  medium:   { label: 'Średnie',         color: '#7B4F1A', bg: 'rgba(201,144,58,0.18)' },
  high:     { label: 'Wysokie',         color: '#C1421F', bg: 'rgba(193,66,31,0.15)' },
  very_high:{ label: 'Bardzo wysokie',  color: '#7B0000', bg: 'rgba(180,0,0,0.14)' },
};

export interface AlertPlant {
  name_pl: string;
  icon: string;
  level: string;
}

export async function sendPollenAlertEmail(
  apiKey: string,
  to: string,
  name: string | null,
  cityName: string,
  alertPlants: AlertPlant[]
): Promise<boolean> {
  const greeting = name ? `Cześć ${name}` : 'Cześć';
  const plantsHtml = alertPlants.map(p => {
    const ll = LEVEL_LABELS[p.level] ?? LEVEL_LABELS.medium;
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:15px">${p.icon} ${p.name_pl}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right">
        <span style="background:${ll.bg};color:${ll.color};font-weight:700;font-size:12px;padding:3px 10px;border-radius:20px">${ll.label}</span>
      </td>
    </tr>`;
  }).join('');

  return sendEmail(apiKey, {
    to,
    subject: `Alerty pyłkowe — ${cityName} · CoPyli`,
    html: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#2d6a4f;padding:32px 40px;text-align:center">
          <span style="font-size:28px">🌿</span>
          <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700">CoPyli</h1>
          <p style="margin:4px 0 0;color:#95d5b2;font-size:13px">Alert pyłkowy · ${cityName}</p>
        </td></tr>
        <tr><td style="padding:40px">
          <h2 style="margin:0 0 8px;color:#1b4332;font-size:20px">${greeting}!</h2>
          <p style="margin:0 0 24px;color:#374151;line-height:1.6">
            Dziś w <strong>${cityName}</strong> stężenie pyłków Twoich alergenów przekracza ustawiony próg:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${plantsHtml}
          </table>
          <div style="text-align:center;margin:32px 0">
            <a href="https://copyli.pl" style="background:#2d6a4f;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">
              Sprawdź szczegóły na CoPyli
            </a>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5">
            Możesz zmienić ustawienia alertów na stronie
            <a href="https://copyli.pl/ustawienia" style="color:#2d6a4f">ustawień konta</a>.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">© 2026 CoPyli.pl — Mapa pylenia dla alergików</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendPasswordChangedEmail(
  apiKey: string,
  to: string,
  name: string | null
): Promise<boolean> {
  const greeting = name ? `Cześć ${name}` : 'Cześć';

  return sendEmail(apiKey, {
    to,
    subject: 'Hasło zostało zmienione — CoPyli',
    html: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#2d6a4f;padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🌿 CoPyli</h1>
        </td></tr>
        <tr><td style="padding:40px">
          <h2 style="margin:0 0 16px;color:#1b4332">✅ Hasło zostało zmienione</h2>
          <p style="margin:0 0 16px;color:#374151;line-height:1.6">
            ${greeting}, Twoje hasło do CoPyli zostało właśnie zmienione.
          </p>
          <p style="margin:0;color:#374151;line-height:1.6">
            Jeśli to nie Ty dokonałeś tej zmiany, natychmiast
            <a href="https://copyli.pl/zapomnialem-hasla" style="color:#2d6a4f">zresetuj hasło</a>
            i skontaktuj się z nami.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">© 2026 CoPyli.pl</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
