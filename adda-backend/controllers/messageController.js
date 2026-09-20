const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { saveBufferToGridFS, streamFileToResponse } = require('../utils/gridfsHelper');

// @desc    Send a message (text and/or one media file)
// @route   POST /api/messages/:receiverId
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const { text } = req.body;

  if (!text && !req.file) {
    res.status(400);
    throw new Error('Message needs text or a media file');
  }

  let media = { fileId: null, contentType: null };
  if (req.file) {
    const fileId = await saveBufferToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    media = { fileId, contentType: req.file.mimetype };
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    text: text || '',
    media,
  });

  await Notification.create({
    recipient: receiverId,
    sender: req.user._id,
    type: 'message',
    text: `${req.user.name} sent you a message`,
  });

  // Real-time delivery via socket.io if the receiver is connected
  const io = req.app.get('io');
  const onlineUsers = req.app.get('onlineUsers');
  const receiverSocketId = onlineUsers?.get(String(receiverId));
  if (io && receiverSocketId) {
    io.to(receiverSocketId).emit('newMessage', message);
  }

  res.status(201).json({ success: true, data: message });
});

// @desc    Get full conversation with another user
// @route   GET /api/messages/:userId
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany(
    { sender: userId, receiver: req.user._id, seen: false },
    { seen: true, seenAt: new Date() }
  );

  res.json({ success: true, data: messages });
});

// @desc    List conversation previews (inbox) — latest message per contact
// @route   GET /api/messages
const getInbox = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const inbox = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$seen', false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  await Message.populate(inbox, { path: '_id', select: 'name avatar isOnline lastSeen', model: 'User' });

  res.json({ success: true, data: inbox });
});

// @desc    Stream a message's attached media
// @route   GET /api/messages/media/:fileId
const getMessageMedia = asyncHandler(async (req, res) => {
  await streamFileToResponse(req.params.fileId, res);
});

module.exports = { sendMessage, getConversation, getInbox, getMessageMedia };