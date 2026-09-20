const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  getPostMedia,
  toggleLikePost,
  sharePost,
} = require('../controllers/postController');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/feed', protect, getFeed);
router.get('/media/:fileId', getPostMedia);
router.get('/user/:userId', protect, getUserPosts);

router.post('/', protect, upload.array('media', 10), createPost);
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.put('/:id/like', protect, toggleLikePost);
router.post('/:id/share', protect, sharePost);

router.post('/:postId/comments', protect, addComment);
router.get('/:postId/comments', protect, getComments);

module.exports = router;