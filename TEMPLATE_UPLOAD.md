# Template Upload and Coordinate Selection

Overview
- Each event can have its own certificate template image (PNG/JPG/JPEG/GIF supported).
- From the Certificates tab, click **Add Template** (if none exists) or **Edit Template** (if already uploaded).
- Upload an image file (max size 5MB). After upload, click a single point on the image to set the name center (the "middle point of the name").
- Click Save to persist the coordinates (these are saved as `nameX`, `nameY` in the template record).

Backend behavior
- Upload endpoint: POST `/api/events/:eventId/template/upload` (authenticated; only event owner allowed)
  - Validates file is an image and file size ≤ 5MB
  - Stores file in `uploads/templates/`
  - Returns template record with `imageData` (base64) and `mimeType` for ease of rendering in frontend

- Coordinates endpoint: POST `/api/events/:eventId/template/coordinates` (authenticated; only event owner)
  - Accepts `{ nameX, nameY, fontSize, fontColor }` and updates or creates a template record

Frontend
- Template Editor: allows upload and then clicking on image to set the name center
- Save button is disabled until a point is selected

Tests
- Backend Jest tests added (backend/test/templates.test.js) covering:
  - Successful PNG upload and response containing base64 data
  - GET template returning `imageData` and `mimeType`
  - Setting coordinates via POST `/coordinates`
  - Rejecting non-image uploads with 400

Notes / Edge cases
- Upload non-image or >5MB file → 400 error returned
- If the template file can't be read, the backend still returns the template DB record without `imageData` and `mimeType`

If you want, I can now:
- Add a small frontend test suite covering the TemplateEditor interactions (upload → click → save)
- Add a small visual guide (screenshot or animation) for selecting the name center
