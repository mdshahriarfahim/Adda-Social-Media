const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket = null;

/**
 * Connects to MongoDB and initializes a GridFSBucket named "media".
 * GridFS lets us store files (avatars, cover photos, post images/videos)
 * directly inside MongoDB — so NOTHING ever touches the local disk.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    gfsBucket = new GridFSBucket(conn.connection.db, {
      bucketName: 'media',
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log('✅ GridFS bucket "media" ready — all files will live inside MongoDB');
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const getBucket = () => {
  if (!gfsBucket) {
    throw new Error('GridFS bucket not initialized yet. Call connectDB() first.');
  }
  return gfsBucket;
};

module.exports = { connectDB, getBucket };