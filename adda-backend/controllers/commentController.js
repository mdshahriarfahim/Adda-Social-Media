const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Add a comment (or reply) to a post
// @route   POST /api/posts/:postId/comments
const addComment = asyncHandler(async (req, res) => {
  const { text, parentComment } = req.body;
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const comment = await Comment.create({
    post: post._id,
    user: req.user._id,
    text,
    parentComment: parentComment || null,
  });

  post.comments.push(comment._id);
  await post.save();

  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
  }

  if (String(post.user) !== String(req.user._id)) {
    await Notification.create({
      recipient: post.user,
      sender: req.user._id,
      type: 'comment_post',
      post: post._id,
      comment: comment._id,
      text: `${req.user.name} commented on your post`,
    });
  }

  const populated = await comment.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get all comments for a post
// @route   GET /api/posts/:postId/comments
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId, parentComment: null })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar')
    .populate({ path: 'replies', populate: { path: 'user', select: 'name avatar' } });

  res.json({ success: true, data: comments });
});

// @desc    Update own comment
// @route   PUT /api/comments/:id
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (String(comment.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit your own comments');
  }
  comment.text = req.body.text ?? comment.text;
  await comment.save();
  res.json({ success: true, data: comment });
});

// @desc    Delete own comment
// @route   DELETE /api/comments/:id
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (String(comment.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own comments');
  }

  await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
  await comment.deleteOne();

  res.json({ success: true, message: 'Comment deleted' });
});

// @desc    Like / unlike a comment
// @route   PUT /api/comments/:id/like
const toggleLikeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const alreadyLiked = comment.likes.some((id) => String(id) === String(req.user._id));
  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => String(id) !== String(req.user._id));
  } else {
    comment.likes.push(req.user._id);
  }
  await comment.save();

  res.json({ success: true, liked: !alreadyLiked, likesCount: comment.likes.length });
});

module.exports = { addComment, getComments, updateComment, deleteComment, toggleLikeComment };