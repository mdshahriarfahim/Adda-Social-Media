const express = require('express');
const router = express.Router();
const { updateComment, deleteComment, toggleLikeComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, toggleLikeComment);

module.exports = router;