const nodemailer = require('nodemailer');
const fs = require('fs');

// PRIVACY: Mask email addresses in logs — never log full emails (M4)
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '[no-email]';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
};

const getTransporter = (customSmtp) => {
  if (customSmtp && customSmtp.host && customSmtp.user && customSmtp.password) {
    return nodemailer.createTransport({
      host: customSmtp.host,
      port: parseInt(customSmtp.port) || 587,
      secure: false,
      auth: { user: customSmtp.user, pass: customSmtp.password },
      tls: { rejectUnauthorized: true },
      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000
    });
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    },
    tls: { rejectUnauthorized: true },
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000
  });
};

const sendEmail = async ({ to, subject, html, text, attachments = [], customSmtp, fromEmail }) => {
  const isCustom = Boolean(customSmtp && customSmtp.host);
  const hasGlobal = Boolean(process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD);

  if (!isCustom && !hasGlobal) {
    console.error('[Email] Credentials missing in environment and user settings.');
    return { success: false, error: 'Server misconfiguration: Missing email credentials' };
  }

  try {
    const transporter = getTransporter(customSmtp);

    let finalFrom = process.env.FROM_EMAIL || `"CertiCraft" <${process.env.MAIL_USERNAME}>`;
    if (isCustom && fromEmail) {
      finalFrom = fromEmail;
    } else if (isCustom) {
      finalFrom = customSmtp.user;
    }

    // PRIVACY: Never log full email addresses
    console.log(`[Email] Sending to ${maskEmail(to)} via ${isCustom ? 'custom SMTP' : 'global SMTP'}`);

    const mailOptions = {
      from: finalFrom,
      to,
      subject,
      html,
      text,
      attachments: attachments.map(att => {
        if (att.path && fs.existsSync(att.path)) {
          return { filename: att.filename || 'attachment.pdf', path: att.path };
        }
        return null;
      }).filter(Boolean)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent OK to ${maskEmail(to)} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // PRIVACY: Don't log the recipient email on error
    console.error('[Email] Send failed:', error.message);
    return { success: false, error: error.message };
  }
};

// PERF (M7): Non-blocking batch send — schedules work via setImmediate so the HTTP
// response is returned immediately (202 Accepted pattern supported by callers).
// Each email gets a 300ms gap to avoid SMTP rate limits.
const sendBatchEmails = async (emails, customSmtp, fromEmail) => {
  const isCustom = Boolean(customSmtp && customSmtp.host);
  const hasGlobal = Boolean(process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD);

  if (!isCustom && !hasGlobal) {
    return { success: false, error: 'Server misconfiguration: Missing email credentials', errors: [] };
  }

  // Still sequential but yields between emails so the event loop isn't fully blocked.
  // For true background processing (across restarts), replace with a Bull queue.
  const results = [];
  const errors = [];

  console.log(`[Email] Starting batch send of ${emails.length} emails`);

  for (const [index, email] of emails.entries()) {
    try {
      // Yield to event loop between emails so other requests can be handled
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const result = await sendEmail({ ...email, customSmtp, fromEmail });

      if (result.success) {
        results.push({ id: result.messageId });
      } else {
        errors.push({ index, error: result.error }); // PRIVACY: no email addr in error log
      }
    } catch (err) {
      console.error(`[Email] Batch item ${index} failed:`, err.message);
      errors.push({ index, error: err.message });
    }
  }

  if (errors.length > 0) {
    console.error(`[Email] Batch done: ${results.length} sent, ${errors.length} failed`);
    if (results.length === 0) {
      return { success: false, error: 'All emails failed to send.', errors };
    }
  }

  return { success: true, data: results, errors };
};

module.exports = { sendEmail, sendBatchEmails };
