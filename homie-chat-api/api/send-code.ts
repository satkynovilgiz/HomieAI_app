const RESEND_URL = 'https://api.resend.com/emails';

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

// Proxies Resend so the API key stays server-side — a direct client fetch()
// to api.resend.com is blocked by CORS from a browser anyway, and would ship
// the secret key inside the app bundle for native builds. Same pattern as
// api/chat.ts proxying Groq.
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

    const resendRes = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Homie <onboarding@resend.dev>',
        to: [toEmail],
        subject: 'Your Homie verification code',
        html: emailHtml(toName || 'there', code),
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.json().catch(() => ({}));
      res.status(500).json({ success: false, error: errBody?.message || `Resend error ${resendRes.status}` });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('send-code error', err);
    res.status(500).json({ success: false, error: err?.message || 'internal error' });
  }
}
