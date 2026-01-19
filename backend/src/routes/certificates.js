const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Certificate, Participant, Event, Template, ActivityLog } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email');
const { uploadFile, isSupabaseUrl, downloadFileFromUrl } = require('../utils/supabase');
const path = require('path');
const fs = require('fs');
const { generateCertificatePdf } = require('../utils/certificateGenerator');

// output dir
const certOutDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');
fs.mkdirSync(certOutDir, { recursive: true });

const { Collaborator } = require('../models');

const checkEventOwnership = async (req, res, next) => {
  const eventId = req.params.eventId;

  // Check if user is the organizer
  const event = await Event.findOne({ where: { id: eventId, organizerId: req.user.id } });
  if (event) return next();

  // Check if user is an accepted collaborator
  const isCollab = await Collaborator.findOne({
    where: {
      eventId,
      userId: req.user.id,
      status: 'ACCEPTED'
    }
  });

  if (isCollab) return next();

  return res.status(403).json({ error: 'Access denied: You must be the organizer or an accepted collaborator' });
};

// generate certificates for event
router.post('/events/:eventId/generate', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const participants = await Participant.findAll({ where: { eventId } });
    const created = [];
    for (const p of participants) {
      // Check if certificate entry exists, but don't skip if file exists
      let existing = await Certificate.findOne({ where: { participantId: p.id, eventId } });

      if (existing && existing.generationStatus === 'GENERATED') {
        // Skip if already generated
        continue;
      }

      if (!existing) {
        existing = await Certificate.create({
          verificationId: uuidv4(),
          participantId: p.id,
          eventId,
          generationStatus: 'PENDING'
        });
      }

      // Try to generate file using template
      try {
        const template = await Template.findOne({ where: { eventId } });
        if (!template || !template.filePath) {
          await existing.update({ generationStatus: 'FAILED', errorMessage: 'Template not found' });
          continue;
        }

        let templatePath = template.filePath;
        let tempTemplatePath = null;

        // If template is a Supabase URL, download it to a temporary file
        if (isSupabaseUrl(template.filePath)) {
          try {
            const buffer = await downloadFileFromUrl(template.filePath);
            tempTemplatePath = path.join(certOutDir, `temp_template_${Date.now()}.png`);
            fs.writeFileSync(tempTemplatePath, buffer);
            templatePath = tempTemplatePath;
          } catch (err) {
            await existing.update({ generationStatus: 'FAILED', errorMessage: 'Failed to download template' });
            continue;
          }
        } else if (!fs.existsSync(template.filePath)) {
          await existing.update({ generationStatus: 'FAILED', errorMessage: 'Template file not found' });
          continue;
        }

        const outPath = path.join(certOutDir, `cert_${existing.id}.pdf`);
        const coords = { nameX: template.nameX, nameY: template.nameY };
        const qrCoords = { qrX: template.qrX, qrY: template.qrY };
        await generateCertificatePdf({
          templatePath: templatePath,
          name: p.name,
          coords,
          fontSize: template.fontSize,
          fontColor: template.fontColor,
          qrCoords,
          qrSize: template.qrSize || 100,
          verificationId: existing.verificationId,
          outputPath: outPath
        });

        // Clean up temporary template file if we created one
        if (tempTemplatePath && fs.existsSync(tempTemplatePath)) {
          fs.unlinkSync(tempTemplatePath);
        }

        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await uploadFile('certificates', 'pdfs', outPath);

        const storagePath = uploadData?.publicUrl || outPath;

        await existing.update({ filePath: storagePath, generationStatus: 'GENERATED', generatedAt: new Date() });
        created.push(existing);
      } catch (err) {
        await existing.update({ generationStatus: 'FAILED', errorMessage: err.message });
      }
    }

    if (created.length > 0) {
      await ActivityLog.create({
        eventId,
        userId: req.user.id,
        action: 'GENERATE_CERTIFICATES',
        details: `Generated ${created.length} certificates`
      });
    }

    res.json({ createdCount: created.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/events/:eventId/status', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    // We want a list of certificates with participant info
    const participants = await Participant.findAll({ where: { eventId } });
    const certificates = await Certificate.findAll({ where: { eventId } });

    // Map them together
    const result = participants.map(p => {
      const cert = certificates.find(c => String(c.participantId) === String(p.id));
      return {
        id: cert ? cert.id : null,
        participantId: p.id,
        participantName: p.name,
        email: p.email,
        generationStatus: cert ? cert.generationStatus : 'NOT_GENERATED',
        emailStatus: cert ? cert.emailStatus : 'NOT_SENT',
        updateEmailStatus: p.updateEmailStatus || 'NOT_SENT',
        verificationId: cert ? cert.verificationId : null,
        generatedAt: cert ? cert.generatedAt : null
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const archiver = require('archiver');

router.get('/:id/download', auth, async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id, { include: [Participant, Event] });
    if (!cert) return res.status(404).json({ message: 'Not found' });
    if (!cert.filePath) return res.status(404).json({ message: 'Certificate file not found' });

    // If it's a Supabase URL, redirect to it
    if (isSupabaseUrl(cert.filePath)) {
      return res.redirect(cert.filePath);
    }

    // If it's a local file, stream it
    if (!fs.existsSync(cert.filePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="certificate_${cert.id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    const stream = fs.createReadStream(cert.filePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/events/:eventId/download-all', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const certs = await Certificate.findAll({ where: { eventId, generationStatus: 'GENERATED' }, include: [Participant] });
    if (!certs.length) return res.status(404).json({ message: 'No generated certificates found for this event' });

    res.setHeader('Content-Disposition', `attachment; filename="event_${eventId}_certificates.zip"`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => { throw err; });
    archive.pipe(res);

    const tempFiles = [];

    for (const cert of certs) {
      if (cert.filePath) {
        if (isSupabaseUrl(cert.filePath)) {
          // Download from Supabase to temporary file
          try {
            const buffer = await downloadFileFromUrl(cert.filePath);
            const tempPath = path.join(certOutDir, `temp_zip_${Date.now()}_${cert.id}.pdf`);
            fs.writeFileSync(tempPath, buffer);
            archive.file(tempPath, { name: `certificate_${cert.id}_${cert.Participant.name.replace(/\s+/g, '_')}.pdf` });
            tempFiles.push(tempPath);
          } catch (err) {
            console.error('Failed to download certificate for ZIP:', err);
          }
        } else if (fs.existsSync(cert.filePath)) {
          archive.file(cert.filePath, { name: `certificate_${cert.id}_${cert.Participant.name.replace(/\s+/g, '_')}.pdf` });
        }
      }
    }

    await archive.finalize();

    // Clean up temp files after archive is finalized
    // Use setImmediate to ensure archive has finished writing
    setImmediate(() => {
      tempFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/send-email', auth, async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id, {
      include: [Participant, Event]
    });
    if (!cert) return res.status(404).json({ message: 'Not found' });

    const attachments = [];
    let tempFilePath = null;

    if (cert.filePath) {
      if (isSupabaseUrl(cert.filePath)) {
        // Download from Supabase to temporary file for email attachment
        try {
          const buffer = await downloadFileFromUrl(cert.filePath);
          tempFilePath = path.join(certOutDir, `temp_cert_email_${Date.now()}.pdf`);
          fs.writeFileSync(tempFilePath, buffer);
          attachments.push({ filename: `certificate_${cert.id}.pdf`, path: tempFilePath });
        } catch (err) {
          console.error('Failed to download certificate for email:', err);
          // Continue without attachment
        }
      } else if (fs.existsSync(cert.filePath)) {
        attachments.push({ filename: `certificate_${cert.id}.pdf`, path: cert.filePath });
      }
    }

    const result = await sendEmail({
      to: cert.Participant.email,
      subject: `Certificate for ${cert.Event.eventName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Congratulations ${cert.Participant.name}!</h2>
          <p>You have successfully completed <strong>${cert.Event.eventName}</strong>.</p>
          <p>You can verify your certificate at: 
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${cert.verificationId}">
              Verfication Link
            </a>
          </p>
          <p>Best regards,<br/>The CertiCraft Team</p>
        </div>
      `,
      attachments
    });

    // Clean up temporary file if created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (result.success) {
      await cert.update({ emailStatus: 'SENT', emailSentAt: new Date() });
      await ActivityLog.create({
        eventId: cert.eventId,
        userId: req.user.id,
        action: 'SEND_EMAIL',
        details: `Sent certificate email to ${cert.Participant.name}`
      });
      res.json({ message: 'Email sent successfully' });
    } else {
      await cert.update({ emailStatus: 'FAILED' });
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/:eventId/send-all', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const certs = await Certificate.findAll({
      where: { eventId, generationStatus: 'GENERATED' },
      include: [Participant, Event]
    });

    const emailPayloads = [];
    const certMap = new Map(); // To track which cert corresponds to which payload used

    // Prepare payloads
    for (const cert of certs) {
      const attachments = [];
      let tempFilePath = null;

      if (cert.filePath) {
        if (isSupabaseUrl(cert.filePath)) {
          try {
            const buffer = await downloadFileFromUrl(cert.filePath);
            tempFilePath = path.join(certOutDir, `temp_cert_email_batch_${Date.now()}_${cert.id}.pdf`);
            fs.writeFileSync(tempFilePath, buffer);
            attachments.push({ filename: `certificate_${cert.id}.pdf`, path: tempFilePath });
          } catch (err) {
            console.error('Failed to download certificate for email:', err);
          }
        } else if (fs.existsSync(cert.filePath)) {
          attachments.push({ filename: `certificate_${cert.id}.pdf`, path: cert.filePath });
        }
      }

      const payload = {
        to: cert.Participant.email,
        subject: `Certificate for ${cert.Event.eventName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Congratulations ${cert.Participant.name}!</h2>
            <p>You have successfully completed <strong>${cert.Event.eventName}</strong>.</p>
            <p>You can verify your certificate at: 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${cert.verificationId}">
                Verfication Link
              </a>
            </p>
          </div>
        `,
        attachments
      };

      emailPayloads.push(payload);
      certMap.set(cert.Participant.email, { cert, tempFilePath });
    }

    if (emailPayloads.length === 0) {
      return res.json({ message: 'No certificates to send.' });
    }

    const { sendBatchEmails } = require('../utils/email');
    const result = await sendBatchEmails(emailPayloads);

    // Cleanup temp files & Update Status
    // Since batch send is all-or-nothing per chunk or returns individual statuses, 
    // Resend batch returns an object with 'data' array containing ids.
    // If it throws an error, we assume failure for all in that batch.

    // For simplicity, if batch succeeds, we mark all as SENT. 
    // Ideally we match by index but Resend batch response order matches request order.

    if (result.success) {
      const date = new Date();
      await Promise.all(certs.map(async (cert) => {
        const info = certMap.get(cert.Participant.email);
        if (info && info.tempFilePath && fs.existsSync(info.tempFilePath)) {
          fs.unlinkSync(info.tempFilePath);
        }
        return cert.update({ emailStatus: 'SENT', emailSentAt: date });
      }));

      await ActivityLog.create({
        eventId,
        userId: req.user.id,
        action: 'SEND_ALL_EMAILS',
        details: `Sent ${certs.length} certificate emails via batch`
      });

      res.json({ message: `Successfully sent ${certs.length} emails` });
    } else {
      // Cleanup anyway
      certs.forEach(cert => {
        const info = certMap.get(cert.Participant.email);
        if (info && info.tempFilePath && fs.existsSync(info.tempFilePath)) {
          fs.unlinkSync(info.tempFilePath);
        }
      });

      // Mark as failed if the whole batch process failed unexpectedly
      await Promise.all(certs.map(c => c.update({ emailStatus: 'FAILED' })));
      res.status(500).json({ error: result.error || 'Failed to send batch emails' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/:eventId/send-updates', auth, checkEventOwnership, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { subject, content } = req.body;
    const participants = await Participant.findAll({ where: { eventId } });
    const event = await Event.findByPk(eventId);
    const { sendBatchEmails } = require('../utils/email');

    if (participants.length === 0) {
      return res.json({ message: 'No participants to update.' });
    }

    const emailPayloads = participants.map(p => ({
      to: p.email,
      subject: subject,
      html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <p>${content.replace(/\n/g, '<br/>')}</p>
            <hr/>
            <p>Best regards,<br/>${event.organizerName}<br/><em>${event.eventName} Organizer</em></p>
          </div>
        `
    }));

    const result = await sendBatchEmails(emailPayloads);

    if (result.success) {
      await Promise.all(participants.map(p => p.update({ updateEmailStatus: 'SENT' })));
      res.json({ message: `Updates sent to ${participants.length} participants` });
    } else {
      await Promise.all(participants.map(p => p.update({ updateEmailStatus: 'FAILED' })));
      res.status(500).json({ error: result.error || 'Failed to send batch updates' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:participantId/resend-update', auth, async (req, res) => {
  try {
    const { participantId } = req.params;
    // This just resets the status in the frontend's view of the list
    // Or we could trigger a specific email here. 
    // The frontend says: 'Email status reset. Please include in next "Send Mass Updates" batch.'
    // So we don't actually send an email, just return success.
    res.json({ message: 'Status reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/verify/:verificationId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      where: { verificationId: req.params.verificationId },
      include: [Participant, Event]
    });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    res.json({
      participantName: cert.Participant.name,
      eventName: cert.Event.eventName,
      organizerName: cert.Event.organizerName,
      generatedAt: cert.generatedAt,
      verificationId: cert.verificationId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/events/:eventId/preview-certificate', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { nameX, nameY, fontSize, fontColor, qrX, qrY, qrSize } = req.body;

    const template = await Template.findOne({ where: { eventId } });
    if (!template) return res.status(404).json({ message: 'Template not found' });

    let templatePath = template.filePath;
    let tempTemplatePath = null;
    let tempOutPath = path.join(certOutDir, `preview_${Date.now()}.pdf`);

    // Handle Supabase template
    if (isSupabaseUrl(template.filePath)) {
      try {
        const buffer = await downloadFileFromUrl(template.filePath);
        tempTemplatePath = path.join(certOutDir, `temp_preview_template_${Date.now()}.png`);
        fs.writeFileSync(tempTemplatePath, buffer);
        templatePath = tempTemplatePath;
      } catch (err) {
        return res.status(500).json({ error: 'Failed to download template for preview' });
      }
    } else if (!fs.existsSync(template.filePath)) {
      return res.status(404).json({ error: 'Template file not found' });
    }

    // Generate Preview PDF
    await generateCertificatePdf({
      templatePath: templatePath,
      name: 'John Doe', // generic preview name
      coords: { nameX, nameY },
      fontSize: fontSize || 40,
      fontColor: fontColor || '#000000',
      qrCoords: { qrX, qrY },
      qrSize: qrSize || 100,
      verificationId: 'PREVIEW-123',
      outputPath: tempOutPath
    });

    // Stream back to client
    res.setHeader('Content-Type', 'application/pdf');
    const stream = fs.createReadStream(tempOutPath);
    stream.pipe(res);

    // Cleanup after stream finishes
    stream.on('close', () => {
      if (fs.existsSync(tempOutPath)) fs.unlinkSync(tempOutPath);
      if (tempTemplatePath && fs.existsSync(tempTemplatePath)) fs.unlinkSync(tempTemplatePath);
    });

    stream.on('error', (err) => {
      console.error('Preview stream error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Failed to stream preview' });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;