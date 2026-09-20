const { Readable } = require('stream');
const mongoose = require('mongoose');
const { getBucket } = require('../config/db');

/**
 * Saves a Buffer (from multer memoryStorage) directly into MongoDB via GridFS.
 * Returns the new file's ObjectId. Nothing ever touches local disk.
 */
const saveBufferToGridFS = (buffer, filename, contentType) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    Readable.from(buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id));
  });
};

/**
 * Streams a file straight out of MongoDB to the HTTP response.
 */
const streamFileToResponse = async (fileId, res) => {
  const bucket = getBucket();
  const _id = new mongoose.Types.ObjectId(fileId);

  const files = await bucket.find({ _id }).toArray();
  if (!files || files.length === 0) {
    res.status(404);
    throw new Error('File not found');
  }

  res.set('Content-Type', files[0].contentType || 'application/octet-stream');
  res.set('Cache-Control', 'public, max-age=31536000');

  bucket
    .openDownloadStream(_id)
    .on('error', () => res.status(404).end())
    .pipe(res);
};

/**
 * Deletes a file from GridFS (e.g. when replacing an avatar or deleting a post).
 */
const deleteFileFromGridFS = async (fileId) => {
  if (!fileId) return;
  try {
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (err) {
    // Non-fatal — file may already be gone
    console.warn('GridFS delete warning:', err.message);
  }
};

module.exports = { saveBufferToGridFS, streamFileToResponse, deleteFileFromGridFS };