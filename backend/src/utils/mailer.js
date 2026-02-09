const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function wrapHtml({ title, subtitle, bodyHtml, ctaText, ctaUrl }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:40px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
      <div style="background:#22c55e;padding:22px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:26px;">ReWear</h1>
        <p style="margin:6px 0 0;color:#dcfce7;font-size:13px;">Sustainable Fashion • Circular Economy</p>
      </div>
      <div style="padding:28px;color:#111827;">
        <h2 style="margin:0 0 8px 0;font-size:20px;">${title}</h2>
        <p style="margin:0 0 16px 0;color:#4b5563;line-height:1.6;">${subtitle}</p>
        ${bodyHtml || ""}
        ${
          ctaUrl
            ? `<div style="text-align:center;margin:24px 0;">
                <a href="${ctaUrl}" style="background:#22c55e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:700;">
                  ${ctaText || "Open ReWear"}
                </a>
              </div>`
            : ""
        }
        <p style="margin:18px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">
          If you didn’t request this, you can ignore this email.
        </p>
      </div>
      <div style="background:#f9fafb;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
        © ${new Date().getFullYear()} ReWear • Built with sustainability in mind ♻️
      </div>
    </div>
  </div>
  `;
}

async function sendEmail({ to, subject, text, html }) {
  try {
    const resp = await resend.emails.send({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Resend response:", resp);
    return resp;
  } catch (err) {
    console.error("❌ Resend send failed:", err);
    throw err;
  }
}

async function sendVerifyEmail(to, name, verifyUrl) {
  const subject = "Verify your ReWear email address";
  const text = `Hi ${name},\n\nVerify your email:\n${verifyUrl}\n\nReWear Team`;

  const html = wrapHtml({
    title: `Verify your email, ${name}`,
    subtitle: "One quick step to activate your account and keep ReWear safe.",
    bodyHtml: `<p style="margin:0;line-height:1.7;color:#374151;">
      Click the button below to verify your email address.
    </p>`,
    ctaText: "Verify Email",
    ctaUrl: verifyUrl,
  });

  return sendEmail({ to, subject, text, html });
}

async function sendWelcomeEmail(to, name, appUrl) {
  const subject = "Welcome to ReWear 🎉 Your account is ready";
  const text = `Hi ${name},\n\nWelcome to ReWear! Start swapping:\n${appUrl}\n\nReWear Team`;

  const html = wrapHtml({
    title: `Welcome to ReWear, ${name}! 🎉`,
    subtitle: "Your account is active. Let’s reduce textile waste together.",
    bodyHtml: `<ul style="margin:14px 0 0 18px;color:#374151;line-height:1.7;">
      <li>List clothes you no longer use</li>
      <li>Browse items from the community</li>
      <li>Send and manage swap requests</li>
    </ul>`,
    ctaText: "Open ReWear",
    ctaUrl: appUrl,
  });

  return sendEmail({ to, subject, text, html });
}

module.exports = {
  sendVerifyEmail,
  sendWelcomeEmail,
};
