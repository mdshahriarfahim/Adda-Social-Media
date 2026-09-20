const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { saveBufferToGridFS, streamFileToResponse, deleteFileFromGridFS } = require('../utils/gridfsHelper');

// @desc    Create a post (text + optional media, all stored in MongoDB)
// @route   POST /api/posts
const createPost = asyncHandler(async (req, res) => {
  const { text, privacy } = req.body;

  if (!text && (!req.files || req.files.length === 0)) {
    res.status(400);
    throw new Error('A post needs text or at least one media file');
  }

  const media = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const fileId = await saveBufferToGridFS(file.buffer, file.originalname, file.mimetype);
      media.push({
        fileId,
        contentType: file.mimetype,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
      });
    }
  }

  const post = await Post.create({
    user: req.user._id,
    text: text || '',
    media,
    privacy: privacy || 'public',
  });

  const populated = await post.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get news feed (own posts + friends' posts), newest first
// @route   GET /api/posts/feed
const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const feedUserIds = [req.user._id, ...req.user.friends];

  const posts = await Post.find({
    user: { $in: feedUserIds },
    $or: [{ privacy: 'public' }, { privacy: 'friends' }, { user: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name avatar')
    .populate({
      path: 'comments',
      options: { sort: { createdAt: -1 }, limit: 2 },
      populate: { path: 'user', select: 'name avatar' },
    });

  res.json({ success: true, page, count: posts.length, data: posts });
});

// @desc    Get a single post
// @route   GET /api/posts/:id
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate({
      path: 'comments',
      populate: { path: 'user', select: 'name avatar' },
    });

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json({ success: true, data: post });
});

// @desc    Get all posts by a specific user (their timeline)
// @route   GET /api/posts/user/:userId
const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.params.userId })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar');
  res.json({ success: true, data: posts });
});

// @desc    Update a post's text (owner only)
// @route   PUT /api/posts/:id
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (String(post.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit your own posts');
  }

  post.text = req.body.text ?? post.text;
  post.privacy = req.body.privacy ?? post.privacy;
  post.isEdited = true;
  await post.save();

  res.json({ success: true, data: post });
});

// @desc    Delete a post (owner only) — also removes its media from GridFS
// @route   DELETE /api/posts/:id
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (String(post.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own posts');
  }

  for (const m of post.media) {
    await deleteFileFromGridFS(m.fileId);
  }
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ success: true, message: 'Post deleted' });
});

// @desc    Stream post media straight out of MongoDB
// @route   GET /api/posts/media/:fileId
const getPostMedia = asyncHandler(async (req, res) => {
  await streamFileToResponse(req.params.fileId, res);
});

// @desc    Like / unlike a post (toggle)
// @route   PUT /api/posts/:id/like
const toggleLikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const alreadyLiked = post.likes.some((id) => String(id) === String(req.user._id));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
  } else {
    post.likes.push(req.user._id);
    if (String(post.user) !== String(req.user._id)) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'like_post',
        post: post._id,
        text: `${req.user.name} liked your post`,
      });
    }
  }

  await post.save();
  res.json({ success: true, liked: !alreadyLiked, likesCount: post.likes.length });
});

// @desc    Share a post to your own timeline
// @route   POST /api/posts/:id/share
const sharePost = asyncHandler(async (req, res) => {
  const original = await Post.findById(req.params.id);
  if (!original) {
    res.status(404);
    throw new Error('Post not found');
  }

  const shared = await Post.create({
    user: req.user._id,
    text: req.body.text || '',
    sharedFrom: original._id,
    privacy: req.body.privacy || 'public',
  });

  original.shares.push(req.user._id);
  await original.save();

  if (String(original.user) !== String(req.user._id)) {
    await Notification.create({
      recipient: original.user,
      sender: req.user._id,
      type: 'share_post',
      post: original._id,
      text: `${req.user.name} shared your post`,
    });
  }

  const populated = await shared.populate([
    { path: 'user', select: 'name avatar' },
    { path: 'sharedFrom', populate: { path: 'user', select: 'name avatar' } },
  ]);

  res.status(201).json({ success: true, data: populated });
});

module.exports = {
  createPost,
  getFeed,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  getPostMedia,
  toggleLikePost,
  sharePost,
};