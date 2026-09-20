const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/search', protect, searchUsers);

router.put('/me', protect, updateProfile);
router.put('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/me/cover', protect, upload.single('cover'), uploadCoverPhoto);

router.get('/:id', protect, getUserProfile);
router.get('/:id/avatar', getAvatar);
router.get('/:id/cover', getCoverPhoto);

router.post('/:id/friend-request', protect, sendFriendRequest);
router.post('/:id/accept-request', protect, acceptFriendRequest);
router.post('/:id/reject-request', protect, rejectFriendRequest);
router.delete('/:id/unfriend', protect, unfriendUser);

module.exports = router;