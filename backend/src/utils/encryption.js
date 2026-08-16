const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// SECURITY: No hardcoded fallback key. If ENCRYPTION_KEY is missing or wrong length, crash immediately.
// The key must be a 64-character hex string (32 bytes) stored in your hosting provider's env vars.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, 'hex').length !== 32) {
  console.error('[FATAL] ENCRYPTION_KEY is missing or not a valid 64-character hex string. Set it in your environment variables.');
  process.exit(1);
}

const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error.message);
    return null;
  }
}

module.exports = { encrypt, decrypt };
