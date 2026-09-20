const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getInbox, getMessageMedia } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getInbox);
router.get('/media/:fileId', getMessageMedia);
router.get('/:userId', protect, getConversation);
router.post('/:receiverId', protect, upload.single('media'), sendMessage);

module.exports = router;