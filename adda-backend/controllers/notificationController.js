const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get my notifications
// @route   GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'name avatar')
    .populate('post', 'text');

  res.json({ success: true, data: notifications });
});

// @desc    Mark one notification as seen
// @route   PUT /api/notifications/:id/seen
const markAsSeen = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { seen: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json({ success: true, data: notification });
});

// @desc    Mark all notifications as seen
// @route   PUT /api/notifications/seen-all
const markAllAsSeen = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, seen: false }, { seen: true });
  res.json({ success: true, message: 'All notifications marked as seen' });
});

module.exports = { getNotifications, markAsSeen, markAllAsSeen };