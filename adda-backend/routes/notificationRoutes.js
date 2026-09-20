const express = require('express');
const router = express.Router();
const { getNotifications, markAsSeen, markAllAsSeen } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/seen-all', protect, markAllAsSeen);
router.put('/:id/seen', protect, markAsSeen);

module.exports = router;