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

const sendBatchEmails = async (emails) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('Resend API key missing. Mocking batch email send.');
        return { success: true, count: emails.length };
    }

    try {
        const results = [];
        // Resend batch limit is 100
        const BATCH_SIZE = 100;

        for (let i = 0; i < emails.length; i += BATCH_SIZE) {
            const chunk = emails.slice(i, i + BATCH_SIZE);

            // Format for Resend Batch API
            const batchPayload = chunk.map(email => {
                const payload = {
                    from: 'CertiCraft <onboarding@resend.dev>',
                    to: email.to,
                    subject: email.subject,
                    html: email.html
                };

                if (email.attachments && email.attachments.length > 0) {
                    // Convert attachments for this specific email
                    payload.attachments = email.attachments.map(att => {
                        if (att.path && fs.existsSync(att.path)) {
                            return {
                                filename: att.filename || 'attachment.pdf',
                                content: fs.readFileSync(att.path)
                            };
                        }
                        return null;
                    }).filter(Boolean);
                }

                return payload;
            });

            if (batchPayload.length > 0) {
                const data = await resend.batch.send(batchPayload);
                results.push(...(data.data || []));
                console.log(`✅ Sent batch of ${batchPayload.length} emails. IDs:`, data.data?.map(d => d.id).join(', '));
            }
        }

        return { success: true, daa: results };
    } catch (error) {
        console.error('❌ Resend batch email sending failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail, sendBatchEmails };
