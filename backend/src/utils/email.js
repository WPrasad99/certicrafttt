const nodemailer = require('nodemailer');
const fs = require('fs');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD // App Password
    }
});

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
        console.warn('Gmail credentials missing. Mocking email send.');
        return { success: true, messageId: 'mock-id' };
    }

    try {
        const mailOptions = {
            from: process.env.FROM_EMAIL || `"CertiCraft" <${process.env.MAIL_USERNAME}>`,
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
        console.log('✅ Email sent successfully via Gmail to:', to, '| ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Gmail email sending failed:', error);
        return { success: false, error: error.message };
    }
};

const sendBatchEmails = async (emails) => {
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
        console.warn('Gmail credentials missing. Mocking batch email send.');
        return { success: true, data: emails.map((_, i) => ({ id: `mock-${i}` })) };
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
