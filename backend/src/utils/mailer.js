const axios = require("axios");

function wrapHtml({ title, subtitle, bodyHtml, ctaText, ctaUrl }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:40px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
      <div style="background:#22c55e;padding:22px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:26px;">ReWear</h1>
        <p style="margin:6px 0 0;color:#dcfce7;font-size:13px;">Sustainable Fashion | Circular Economy</p>
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
          If you didn't request this, you can ignore this email.
        </p>
      </div>
      <div style="background:#f9fafb;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
        (c) ${new Date().getFullYear()} ReWear | Built with sustainability in mind
      </div>
    </div>
  </div>
  `;
}

async function sendEmail({ to, subject, text, html }) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY must be set");
    }

    const fromEmail = process.env.MAIL_FROM;
    if (!fromEmail) {
      throw new Error("MAIL_FROM must be set (and verified in Brevo)");
    }

    const payload = {
      sender: { email: fromEmail, name: "ReWear" },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    };

    const resp = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("Email sent (Brevo API):", { to, subject, id: resp.data?.messageId });
    return resp.data;
  } catch (err) {
    console.error("Email send failed (Brevo API):", err.response?.data || err.message);
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
  const subject = "Welcome to ReWear - Your account is ready";
  const text = `Hi ${name},\n\nWelcome to ReWear! Start swapping:\n${appUrl}\n\nReWear Team`;

  const html = wrapHtml({
    title: `Welcome to ReWear, ${name}!`,
    subtitle: "Your account is active. Let's reduce textile waste together.",
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

async function sendSwapRequestEmail({
  to,
  ownerName,
  requesterName,
  itemName,
  message,
  linkUrl,
}) {
  const subject = "New swap request on ReWear";
  const text = `Hi ${ownerName},\n\n${requesterName} sent a swap request for ${itemName}.\n${
    message ? `Message: ${message}\n` : ""
  }\nView details: ${linkUrl}\n\nReWear Team`;

  const html = wrapHtml({
    title: `New swap request for ${ownerName}`,
    subtitle: `${requesterName} requested a swap for ${itemName}.`,
    bodyHtml: `
      <p style="margin:0;line-height:1.7;color:#374151;">
        ${message ? `Message: <strong>${message}</strong>` : "Open ReWear to review the request."}
      </p>
    `,
    ctaText: "Open Swap Requests",
    ctaUrl: linkUrl,
  });

  return sendEmail({ to, subject, text, html });
}

async function sendSwapStatusEmail({
  to,
  requesterName,
  itemName,
  status,
  linkUrl,
}) {
  const normalized = String(status || "").toLowerCase();
  const subject =
    normalized === "accepted"
      ? "Your swap request was accepted"
      : "Your swap request was updated";
  const text = `Hi ${requesterName},\n\nYour request for ${itemName} was ${normalized}.\nView details: ${linkUrl}\n\nReWear Team`;

  const html = wrapHtml({
    title: `Swap request ${normalized}`,
    subtitle: `Your request for ${itemName} is now ${normalized}.`,
    bodyHtml: `<p style="margin:0;line-height:1.7;color:#374151;">
      Open ReWear to continue with next steps.
    </p>`,
    ctaText: "View Swap",
    ctaUrl: linkUrl,
  });

  return sendEmail({ to, subject, text, html });
}

async function sendSwapLogisticsEmail({
  to,
  recipientName,
  updatedByName,
  method,
  meetupLocation,
  meetupAt,
  deliveryOption,
  trackingRef,
  deliveryAddress,
  phoneNumber,
  linkUrl,
}) {
  const isMeetup = method === "MEETUP";
  const subject = `Swap logistics updated: ${method}`;
  const details = isMeetup
    ? `Method: MEETUP\nLocation: ${meetupLocation}\nDate & Time: ${meetupAt}`
    : `Method: DELIVERY\nDelivery option: ${deliveryOption}\nAddress: ${
        deliveryAddress || "Not provided"
      }\nPhone number: ${phoneNumber || "Not provided"}\nTracking/Reference: ${
        trackingRef || "Not provided"
      }`;

  const text = `Hi ${recipientName},\n\n${updatedByName} updated logistics.\n${details}\n\nView details: ${linkUrl}\n\nReWear Team`;

  const html = wrapHtml({
    title: `Logistics updated to ${method}`,
    subtitle: `${updatedByName} updated your swap logistics details.`,
    bodyHtml: isMeetup
      ? `
        <p style="margin:0;line-height:1.7;color:#374151;"><strong>Location:</strong> ${meetupLocation}</p>
        <p style="margin:8px 0 0;line-height:1.7;color:#374151;"><strong>Date & Time:</strong> ${meetupAt}</p>
      `
      : `
        <p style="margin:0;line-height:1.7;color:#374151;"><strong>Delivery option:</strong> ${deliveryOption}</p>
        <p style="margin:8px 0 0;line-height:1.7;color:#374151;"><strong>Address:</strong> ${
          deliveryAddress || "Not provided"
        }</p>
        <p style="margin:8px 0 0;line-height:1.7;color:#374151;"><strong>Phone number:</strong> ${
          phoneNumber || "Not provided"
        }</p>
        <p style="margin:8px 0 0;line-height:1.7;color:#374151;"><strong>Tracking/Reference:</strong> ${
          trackingRef || "Not provided"
        }</p>
      `,
    ctaText: "View Logistics",
    ctaUrl: linkUrl,
  });

  return sendEmail({ to, subject, text, html });
}

async function sendSwapCompletedEmail({
  to,
  recipientName,
  otherPartyName,
  requestedItemName,
  offeredItemName,
  linkUrl,
}) {
  const subject = "Swap completed successfully";
  const text = `Hi ${recipientName},\n\nYour swap with ${otherPartyName} is now completed.\nRequested item: ${requestedItemName}\nOffered item: ${offeredItemName}\n\nView details: ${linkUrl}\n\nReWear Team`;

  const html = wrapHtml({
    title: "Swap marked as completed",
    subtitle: `Your swap with ${otherPartyName} has been completed.`,
    bodyHtml: `
      <p style="margin:0;line-height:1.7;color:#374151;"><strong>Requested item:</strong> ${requestedItemName}</p>
      <p style="margin:8px 0 0;line-height:1.7;color:#374151;"><strong>Offered item:</strong> ${offeredItemName}</p>
    `,
    ctaText: "View Completed Swap",
    ctaUrl: linkUrl,
  });

  return sendEmail({ to, subject, text, html });
}

module.exports = {
  sendVerifyEmail,
  sendWelcomeEmail,
  sendSwapRequestEmail,
  sendSwapStatusEmail,
  sendSwapLogisticsEmail,
  sendSwapCompletedEmail,
};
