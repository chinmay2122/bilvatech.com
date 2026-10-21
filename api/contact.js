import nodemailer from "nodemailer";

const json = (response, status, payload) => {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  return response.status(status).json(payload);
};

const clean = (value, maxLength) =>
  String(value ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return json(response, 405, { success: false, message: "Method not allowed." });
  }

  let body = request.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return json(response, 400, { success: false, message: "Invalid request body." });
    }
  }

  if (body._gotcha) {
    return json(response, 200, {
      success: true,
      message: "Thank you. Your enquiry has been received.",
    });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 5000);

  if (!name || !phone || !email || !message) {
    return json(response, 422, {
      success: false,
      message: "Please complete every required field.",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(response, 422, { success: false, message: "Please enter a valid email address." });
  }
  if (!/^[0-9+\-\s()]{6,40}$/.test(phone)) {
    return json(response, 422, { success: false, message: "Please enter a valid mobile number." });
  }
  if (message.length < 5) {
    return json(response, 422, { success: false, message: "Please provide more detail about your enquiry." });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const recipient = process.env.BILVA_RECIPIENT_EMAIL;
  const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass || !recipient || !fromEmail) {
    return json(response, 503, {
      success: false,
      message: "Enquiry delivery is not configured yet. Please try again later.",
    });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "ssl" || smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");

  try {
    await transporter.sendMail({
      from: { name: process.env.SMTP_FROM_NAME || "Bilva Tech Enquiries", address: fromEmail },
      to: recipient,
      replyTo: { name, address: email },
      subject: `New Bilva Tech enquiry from ${name}`,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\n${message}`,
      html: `<h1>New Bilva Tech enquiry</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Phone:</strong> ${safePhone}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong><br>${safeMessage}</p>`,
    });

    return json(response, 200, {
      success: true,
      message: "Thank you. Your enquiry has been received.",
    });
  } catch (error) {
    console.error("Contact delivery failed", error instanceof Error ? error.message : "Unknown error");
    return json(response, 502, {
      success: false,
      message: "We could not deliver your enquiry right now. Please try again later.",
    });
  }
}
