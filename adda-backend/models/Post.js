const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, maxlength: 5000, default: '' },
    // Post media (images/videos) stored in GridFS — only references kept here
    media: [
      {
        fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
        contentType: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
      },
    ],
    privacy: {
      type: String,
      enum: ['public', 'friends', 'only_me'],
      default: 'public',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sharedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ text: 'text' });

module.exports = mongoose.model('Post', postSchema);