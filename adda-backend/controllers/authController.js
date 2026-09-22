const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (Sign Up)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    data: {
      ...user.toPublicJSON(),
      token: generateToken(user._id),
    },
  });
});

// @desc    Login user & get token (Sign In)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  res.json({
    success: true,
    data: {
      ...user.toPublicJSON(),
      token: generateToken(user._id),
    },
  });
});

// ছোট user object বানায় (id + name + avatar URL) — friends/requests list এ ব্যবহারের জন্য
const miniProfile = (u) => ({
  _id: u._id,
  name: u.name,
  avatar: u.avatar?.fileId ? `/api/users/${u._id}/avatar` : null,
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('friends', 'name avatar')
    .populate('friendRequestsReceived', 'name avatar')
    .populate('friendRequestsSent', 'name avatar');

  // IMPORTANT: register/login এর মতোই ফরম্যাটে (id ফিল্ড সহ) ডেটা পাঠানো হচ্ছে,
  // যাতে page refresh করলেও frontend "নিজের প্রোফাইল" ঠিকমতো চিনতে পারে
  res.json({
    success: true,
    data: {
      ...user.toPublicJSON(),
      friends: user.friends.map(miniProfile),
      friendRequestsReceived: user.friendRequestsReceived.map(miniProfile),
      friendRequestsSent: user.friendRequestsSent.map(miniProfile),
    },
  });
});

// @desc    Logout (mark offline)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  req.user.isOnline = false;
  req.user.lastSeen = new Date();
  await req.user.save();
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = { registerUser, loginUser, getMe, logoutUser };