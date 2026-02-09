const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

// ---------- Helpers ----------
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wrapHtml({ title, subtitle, bodyHtml, ctaText, ctaUrl }) {
  const year = new Date().getFullYear();

  const cta =
    ctaText && ctaUrl
      ? `<div style="text-align:center; margin:26px 0;">
           <a href="${ctaUrl}"
              style="background:#22c55e; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:8px; font-weight:700; display:inline-block;">
             ${ctaText}
           </a>
         </div>`
      : "";

  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:40px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      
      <div style="background:#22c55e; padding:18px 20px;">
        <div style="color:#ffffff; font-size:24px; font-weight:800; text-align:center;">ReWear</div>
        <div style="color:#dcfce7; font-size:13px; text-align:center; margin-top:6px;">
          Sustainable Fashion • Circular Economy
        </div>
      </div>

      <div style="padding:28px 26px; color:#111827;">
        <h2 style="margin:0 0 10px 0; font-size:22px;">${title}</h2>
        ${subtitle ? `<p style="margin:0 0 18px 0; font-size:14px; color:#4b5563; line-height:1.7;">${subtitle}</p>` : ""}
        
        <div style="font-size:14px; color:#1f2937; line-height:1.7;">
          ${bodyHtml}
        </div>

        ${cta}

        <p style="margin:18px 0 0; font-size:12px; color:#6b7280; line-height:1.6;">
          If you didn’t expect this email, you can safely ignore it.
        </p>

        <p style="margin:14px 0 0; font-size:13px; color:#4b5563;">
          — The ReWear Team
        </p>
      </div>

      <div style="background:#f9fafb; padding:14px 18px; text-align:center; font-size:12px; color:#6b7280;">
        © ${year} ReWear • Built with sustainability in mind ♻️
      </div>
    </div>
  </div>`;
}

async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: `"ReWear Team" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

// ---------- Email Types ----------

// ✅ Welcome Email
async function sendWelcomeEmail(to, name, appUrl = process.env.FRONTEND_URL || "http://localhost:5173") {
  const subject = "Welcome to ReWear 🎉 Your account is ready";

  const text = `Hi ${name},

Welcome to ReWear! Your account has been successfully created.

You can now:
- List your clothes for swapping
- Browse items shared by other users
- Send and manage swap requests

Get started: ${appUrl}

Happy swapping,
The ReWear Team`;

  const html = wrapHtml({
    title: `Welcome to ReWear, ${escapeHtml(name)}! 🎉`,
    subtitle: "Your account is ready. Let’s start swapping sustainably.",
    bodyHtml: `
      <ul style="padding-left:18px; margin:12px 0;">
        <li>List your unused clothes for swapping</li>
        <li>Browse items shared by other users</li>
        <li>Send and manage swap requests</li>
        <li>Support a circular fashion community 🌍</li>
      </ul>
    `,
    ctaText: "Start Swapping",
    ctaUrl: appUrl,
  });

  return sendEmail({ to, subject, text, html });
}

// 🔐 Verify Email
async function sendVerifyEmail(to, name, verifyUrl) {
  const subject = "Verify your ReWear email address";

  const text = `Hi ${name},

Please verify your email address to activate your ReWear account:
${verifyUrl}

This link will expire for security.

ReWear Team`;

  const html = wrapHtml({
    title: `Verify your email, ${escapeHtml(name)}`,
    subtitle: "One quick step to activate your account and keep ReWear safe.",
    bodyHtml: `
      <p style="margin:0 0 10px 0;">
        Click the button below to verify your email address.
      </p>
      <p style="margin:0; color:#6b7280; font-size:12px;">
        For security, this link expires soon.
      </p>
    `,
    ctaText: "Verify Email",
    ctaUrl: verifyUrl,
  });

  return sendEmail({ to, subject, text, html });
}

// 📧 Swap Request Email (to owner)
async function sendSwapRequestEmail({
  to,
  ownerName,
  requesterName,
  itemName,
  message,
  linkUrl,
}) {
  const subject = "New swap request received on ReWear";

  const text =
    `Hi ${ownerName},\n\n` +
    `${requesterName} sent you a swap request for: ${itemName}\n` +
    (message ? `Message: ${message}\n\n` : "\n") +
    `Open ReWear to review: ${linkUrl}\n\n` +
    `ReWear Team`;

  const html = wrapHtml({
    title: "You have a new swap request",
    subtitle: `${escapeHtml(requesterName)} is interested in your item: <strong>${escapeHtml(itemName)}</strong>.`,
    bodyHtml: `
      ${
        message
          ? `<div style="background:#f3f4f6;padding:12px 14px;border-radius:8px;margin:14px 0;">
               <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Message</div>
               <div style="line-height:1.7;color:#111827;">${escapeHtml(message)}</div>
             </div>`
          : ""
      }
      <p style="margin:10px 0 0; color:#4b5563;">
        Review the request and accept or reject it from your dashboard.
      </p>
    `,
    ctaText: "View Request",
    ctaUrl: linkUrl,
  });

  return sendEmail({ to, subject, text, html });
}

// 📧 Swap Status Email (to requester)
async function sendSwapStatusEmail({
  to,
  requesterName,
  itemName,
  status, // "accepted" | "rejected"
  linkUrl,
}) {
  const pretty =
    status === "accepted" ? "Accepted ✅" : status === "rejected" ? "Rejected ❌" : status;

  const subject = `Your swap request was ${pretty}`;

  const text =
    `Hi ${requesterName},\n\n` +
    `Your swap request for "${itemName}" was ${status}.\n` +
    `Check details: ${linkUrl}\n\n` +
    `ReWear Team`;

  const html = wrapHtml({
    title: `Request ${pretty}`,
    subtitle: `Update on your request for <strong>${escapeHtml(itemName)}</strong>.`,
    bodyHtml: `
      <p style="margin:0; color:#4b5563;">
        Open ReWear to view the request details and next steps.
      </p>
    `,
    ctaText: "Open My Requests",
    ctaUrl: linkUrl,
  });

  return sendEmail({ to, subject, text, html });
}

module.exports = {
  sendWelcomeEmail,
  sendVerifyEmail,
  sendSwapRequestEmail,
  sendSwapStatusEmail,
};
