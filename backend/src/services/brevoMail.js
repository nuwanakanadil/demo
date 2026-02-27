const axios = require("axios");

async function sendEmail({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey) throw new Error("BREVO_API_KEY missing");
  if (!from) throw new Error("MAIL_FROM missing");

  const payload = {
    sender: { email: from, name: "ReWear" },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
  };

  try {
    const res = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });
    return res.data;
  } catch (err) {
    console.error("Brevo API error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendEmail };