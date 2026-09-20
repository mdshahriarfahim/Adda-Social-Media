const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { saveBufferToGridFS, streamFileToResponse, deleteFileFromGridFS } = require('../utils/gridfsHelper');

// @desc    Get a user's public profile
// @route   GET /api/users/:id
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user.toPublicJSON() });
});

// @desc    Update own profile (name, bio)
// @route   PUT /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  await req.user.save();
  res.json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Upload / replace avatar (stored fully in MongoDB via GridFS)
// @route   PUT /api/users/me/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const oldFileId = req.user.avatar?.fileId;
  const fileId = await saveBufferToGridFS(req.file.buffer, `avatar_${req.user._id}`, req.file.mimetype);

  req.user.avatar = { fileId, contentType: req.file.mimetype };
  await req.user.save();

  if (oldFileId) await deleteFileFromGridFS(oldFileId);

  res.json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Upload / replace cover photo
// @route   PUT /api/users/me/cover
const uploadCoverPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const oldFileId = req.user.coverPhoto?.fileId;
  const fileId = await saveBufferToGridFS(req.file.buffer, `cover_${req.user._id}`, req.file.mimetype);

  req.user.coverPhoto = { fileId, contentType: req.file.mimetype };
  await req.user.save();

  if (oldFileId) await deleteFileFromGridFS(oldFileId);

  res.json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Stream a user's avatar straight from MongoDB
// @route   GET /api/users/:id/avatar
const getAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.avatar?.fileId) {
    res.status(404);
    throw new Error('Avatar not found');
  }
  await streamFileToResponse(user.avatar.fileId, res);
});

// @desc    Stream a user's cover photo straight from MongoDB
// @route   GET /api/users/:id/cover
const getCoverPhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.coverPhoto?.fileId) {
    res.status(404);
    throw new Error('Cover photo not found');
  }
  await streamFileToResponse(user.coverPhoto.fileId, res);
});

// @desc    Search users by name/email
// @route   GET /api/users/search?q=
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, data: [] });

  const users = await User.find({
    $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
    _id: { $ne: req.user._id },
  }).limit(20);

  res.json({ success: true, data: users.map((u) => u.toPublicJSON()) });
});

// ---------- Friend system ----------

// @desc    Send a friend request
// @route   POST /api/users/:id/friend-request
const sendFriendRequest = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === String(req.user._id)) {
    res.status(400);
    throw new Error("You can't send a friend request to yourself");
  }

  const target = await User.findById(targetId);
  if (!target) {
    res.status(404);
    throw new Error('User not found');
  }

  if (target.friends.includes(req.user._id)) {
    res.status(400);
    throw new Error('You are already friends');
  }
  if (target.friendRequestsReceived.includes(req.user._id)) {
    res.status(400);
    throw new Error('Friend request already sent');
  }

  target.friendRequestsReceived.push(req.user._id);
  req.user.friendRequestsSent.push(target._id);
  await target.save();
  await req.user.save();

  await Notification.create({
    recipient: target._id,
    sender: req.user._id,
    type: 'friend_request',
    text: `${req.user.name} sent you a friend request`,
  });

  res.json({ success: true, message: 'Friend request sent' });
});

// @desc    Accept a friend request
// @route   POST /api/users/:id/accept-request
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.id;

  if (!req.user.friendRequestsReceived.includes(requesterId)) {
    res.status(400);
    throw new Error('No pending friend request from this user');
  }

  const requester = await User.findById(requesterId);
  if (!requester) {
    res.status(404);
    throw new Error('User not found');
  }

  req.user.friendRequestsReceived = req.user.friendRequestsReceived.filter((id) => String(id) !== requesterId);
  requester.friendRequestsSent = requester.friendRequestsSent.filter((id) => String(id) !== String(req.user._id));

  req.user.friends.push(requester._id);
  requester.friends.push(req.user._id);

  await req.user.save();
  await requester.save();

  await Notification.create({
    recipient: requester._id,
    sender: req.user._id,
    type: 'friend_accept',
    text: `${req.user.name} accepted your friend request`,
  });

  res.json({ success: true, message: 'Friend request accepted' });
});

// @desc    Reject a friend request
// @route   POST /api/users/:id/reject-request
const rejectFriendRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.id;
  req.user.friendRequestsReceived = req.user.friendRequestsReceived.filter((id) => String(id) !== requesterId);
  await req.user.save();

  await User.findByIdAndUpdate(requesterId, {
    $pull: { friendRequestsSent: req.user._id },
  });

  res.json({ success: true, message: 'Friend request rejected' });
});

// @desc    Unfriend a user
// @route   DELETE /api/users/:id/unfriend
const unfriendUser = asyncHandler(async (req, res) => {
  const friendId = req.params.id;

  req.user.friends = req.user.friends.filter((id) => String(id) !== friendId);
  await req.user.save();

  await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user._id } });

  res.json({ success: true, message: 'Unfriended successfully' });
});

module.exports = {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  uploadCoverPhoto,
  getAvatar,
  getCoverPhoto,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriendUser,
};