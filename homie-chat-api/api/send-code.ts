import nodemailer from 'nodemailer';

// Not a secret — the app password (GMAIL_APP_PASSWORD, a Vercel env var) is
// what actually authenticates.
const GMAIL_USER = 'satkynovilgiz2008@gmail.com';

let transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
  }
  return transporter;
}

interface SendCodeBody {
  toEmail?: string;
  toName?: string;
  code?: string;
}

function emailHtml(toName: string, code: string): string {
  return `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 480px;
      margin: 0 auto;
      background: #07070f;
      color: #f0f0ff;
      padding: 40px 32px;
      border-radius: 16px;
    ">
      <h1 style="
        color: #a78bfa;
        font-size: 28px;
        margin-bottom: 8px;
      ">
        Homie
      </h1>
      <p style="color: #9090c0; margin-bottom: 32px;">
        your AI study buddy
      </p>

      <p style="font-size: 16px; margin-bottom: 8px;">
        hey ${toName}!
      </p>
      <p style="color: #9090c0; margin-bottom: 32px;">
        here is your verification code.
        it expires in 10 minutes. no cap.
      </p>

      <div style="
        background: #0d0b22;
        border: 2px solid #7c3aed;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin-bottom: 32px;
      ">
        <p style="
          color: #9090c0;
          font-size: 12px;
          letter-spacing: 3px;
          margin-bottom: 12px;
        ">
          VERIFICATION CODE
        </p>
        <p style="
          font-size: 48px;
          font-weight: 900;
          color: #a78bfa;
          letter-spacing: 12px;
          margin: 0;
        ">
          ${code}
        </p>
      </div>

      <p style="color: #9090c0; font-size: 13px;">
        Enter this code in the Homie app
        to verify your account.
        If you did not sign up for Homie,
        just ignore this email.
      </p>

      <hr style="
        border: none;
        border-top: 1px solid #1e1e3a;
        margin: 32px 0;
      "/>

      <p style="
        color: #444466;
        font-size: 11px;
        text-align: center;
      ">
        Homie — Free AI Study Buddy
        homieai-steel.vercel.app
      </p>
    </div>
  `;
}

// Sends via Gmail SMTP (app password stays server-side) instead of Resend —
// Resend's sandbox mode blocks sending to anyone but the account owner until
// a custom domain is verified, which Gmail SMTP doesn't require. A direct
// client-side SMTP/fetch call was ruled out: it would ship the Gmail app
// password inside the app bundle for anyone to extract. Same proxy pattern
// as api/chat.ts holding GROQ_API_KEY.
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { toEmail, toName, code } = (req.body || {}) as SendCodeBody;
    if (!toEmail || !code) {
      res.status(400).json({ success: false, error: 'toEmail and code are required' });
      return;
    }

    await getTransporter().sendMail({
      from: `Homie <${GMAIL_USER}>`,
      to: toEmail,
      subject: 'Your Homie verification code',
      html: emailHtml(toName || 'there', code),
    });

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('send-code error', err);
    res.status(500).json({ success: false, error: err?.message || 'internal error' });
  }
}
