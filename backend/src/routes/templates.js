const express = require('express');
const router = express.Router({ mergeParams: true });
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mime = require('mime-types');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'templates');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const auth = require('../middleware/auth');
const { Template, Event, ActivityLog } = require('../models');
const { uploadFile, isSupabaseUrl, downloadFileFromUrl } = require('../utils/supabase');

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

// For now, just accept uploaded files and respond with a placeholder
router.post('/upload', auth, checkEventOwnership, async (req, res) => {
  // Wrap multer invocation to capture fileFilter or size errors and return 400
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const eventId = req.params.eventId;

      // Upload to Supabase
      const { data: uploadData, error: uploadError } = await uploadFile('certificates', 'templates', req.file.path);

      const storagePath = uploadData?.publicUrl || req.file.path;

      // Upsert template
      let template = await Template.findOne({ where: { eventId } });
      if (template) {
        await template.update({ originalName: req.file.originalname, filePath: storagePath });
      } else {
        template = await Template.create({
          eventId,
          originalName: req.file.originalname,
          filePath: storagePath
        });
      }

      await ActivityLog.create({
        eventId,
        userId: req.user.id,
        action: 'UPLOAD_TEMPLATE',
        details: `Uploaded template: ${req.file.originalname} (Supabase: ${!!uploadData?.publicUrl})`
      });

      // Read file and attach base64 data and mime type for frontend convenience
      try {
        const buffer = fs.readFileSync(req.file.path);
        const mimeType = mime.lookup(req.file.path) || 'image/png';
        const imageData = buffer.toString('base64');
        const payload = { ...template.toJSON(), imageData, mimeType };
        return res.json(payload);
      } catch (err) {
        // Return template without image data if file read fails
        return res.json(template);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

router.get('/', auth, checkEventOwnership, async (req, res) => {
  const eventId = req.params.eventId;
  const template = await Template.findOne({ where: { eventId } });
  if (!template) return res.status(404).json({ message: 'no template' });

  // If file exists, include base64 image data and mimeType
  try {
    if (template.filePath) {
      let buffer;
      let mimeType;

      // Check if filePath is a Supabase URL or local path
      if (isSupabaseUrl(template.filePath)) {
        // Fetch from Supabase
        buffer = await downloadFileFromUrl(template.filePath);
        mimeType = 'image/png'; // Default for templates
      } else if (fs.existsSync(template.filePath)) {
        // Read from local disk
        buffer = fs.readFileSync(template.filePath);
        mimeType = mime.lookup(template.filePath) || 'image/png';
      }

      if (buffer) {
        const imageData = buffer.toString('base64');
        return res.json({ ...template.toJSON(), imageData, mimeType });
      }
    }
  } catch (err) {
    console.warn('Failed to read template file:', err.message);
  }

  res.json(template);
});

router.delete('/', auth, checkEventOwnership, async (req, res) => {
  const eventId = req.params.eventId;
  await Template.destroy({ where: { eventId } });
  res.json({ message: 'deleted' });
});

router.post('/coordinates', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    let template = await Template.findOne({ where: { eventId } });
    if (!template) {
      // Create a default one if it doesn't exist but they are setting coords
      template = await Template.create({ eventId, ...req.body });
    } else {
      await template.update(req.body);
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;