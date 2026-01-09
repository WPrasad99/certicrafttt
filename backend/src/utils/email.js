const { Resend } = require('resend');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('Resend API key missing. Mocking email send.');
        return { success: true, messageId: 'mock-id' };
    }

    try {
        // Convert attachments to Resend format
        const resendAttachments = attachments.map(att => {
            if (att.path && fs.existsSync(att.path)) {
                const content = fs.readFileSync(att.path);
                return {
                    filename: att.filename || 'attachment.pdf',
                    content: content
                };
            }
            return null;
        }).filter(Boolean);

        const emailData = {
            from: 'CertiCraft <onboarding@resend.dev>',
            to: to,
            subject: subject,
            html: html
        };

        if (resendAttachments.length > 0) {
            emailData.attachments = resendAttachments;
        }

        const data = await resend.emails.send(emailData);

        console.log('✅ Email sent successfully via Resend to:', to, '| ID:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('❌ Resend email sending failed:');
        console.error('  To:', to);
        console.error('  Error:', error.message);
        console.error('  Details:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
