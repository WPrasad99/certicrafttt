const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
        console.warn('SMTP credentials missing. Mocking email send.');
        // Validate attachment paths exist when mocking
        for (const a of attachments) {
            if (a.path && !fs.existsSync(a.path)) {
                return { success: false, error: `Attachment missing: ${a.path}` };
            }
        }
        return { success: true, messageId: 'mock-id' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"CertiCraft" <${process.env.MAIL_USERNAME}>`,
            to,
            subject,
            text,
            html,
            attachments
        });
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
