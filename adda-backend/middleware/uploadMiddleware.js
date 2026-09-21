const multer = require('multer');

// IMPORTANT: memoryStorage keeps the file in RAM as a Buffer only.
// It is NEVER written to local disk — from here we stream it straight
// into MongoDB via GridFS (see utils/gridfsHelper.js).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: jpg, png, gif, webp, mp4, webm'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

module.exports = upload;