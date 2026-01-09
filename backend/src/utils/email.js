const nodemailer = require('nodemailer');
const fs = require('fs');

// Create reusable transporter object using the default SMTP transport
// Create reusable transporter object using explicit SMTP settings
// Support dynamic host for switching providers (Gmail, Outlook, Brevo)
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: true
    },
    // Extended timeouts to handle network latency
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000
});

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
    // CRITICAL: Fail if credentials are missing
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
        console.error('❌ Email credentials (MAIL_USERNAME/MAIL_PASSWORD) are MISSING in environment variables.');
        return { success: false, error: 'Server misconfiguration: Missing email credentials' };
    }

    try {
        const fromAddress = process.env.FROM_EMAIL || `"CertiCraft" <${process.env.MAIL_USERNAME}>`;
        const host = process.env.MAIL_HOST || 'smtp.gmail.com';
        const port = process.env.MAIL_PORT || 587;

        console.log(`📧 Attempting to send email...`);
        console.log(`   Host: ${host}`);
        console.log(`   Port: ${port}`);
        console.log(`   User: ${process.env.MAIL_USERNAME}`);
        console.log(`   From: ${fromAddress}`);

        const mailOptions = {
            from: fromAddress,
            to: to,
            subject: subject,
            html: html,
            text: text, // Fallback text
            attachments: attachments.map(att => {
                if (att.path && fs.existsSync(att.path)) {
                    return {
                        filename: att.filename || 'attachment.pdf',
                        path: att.path
                    };
                }
                return null;
            }).filter(Boolean)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', to, '| ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

const sendBatchEmails = async (emails) => {
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
        console.error('❌ Gmail credentials (MAIL_USERNAME/MAIL_PASSWORD) are MISSING in environment variables.');
        return { success: false, error: 'Server misconfiguration: Missing email credentials', errors: [] };
    }

    const results = [];
    const errors = [];

    console.log(`Starting batch send of ${emails.length} emails via Gmail...`);

    // Helper to sleep
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const [index, email] of emails.entries()) {
        try {
            // Add a small delay between emails to avoid hitting rapid-fire limits
            if (index > 0) await sleep(500);

            const result = await sendEmail(email);
            if (result.success) {
                results.push({ id: result.messageId });
            } else {
                errors.push({ email: email.to, error: result.error });
            }
        } catch (err) {
            console.error(`Failed to send email to ${email.to}:`, err);
            errors.push({ email: email.to, error: err.message });
        }
    }

    if (errors.length > 0) {
        console.error(`Batch completed with ${errors.length} errors.`);
        // Ensure we still return success: true if at least ONE succeeded, 
        // OR if you prefer strict all-or-nothing, return false. 
        // Usually dependent on partial success needs.
        // Returning success: true so the route doesn't crash, but logging errors.
        if (results.length === 0) {
            return { success: false, error: "All emails failed to send.", errors };
        }
    }

    return { success: true, data: results, errors };
};

module.exports = { sendEmail, sendBatchEmails };
