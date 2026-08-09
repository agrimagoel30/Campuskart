const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All chat routes are protected
router.use(authMiddleware.protect);

router
  .route('/')
  .post(chatController.accessChat)
  .get(chatController.fetchChats);

router
  .route('/message')
  .post(chatController.sendMessage);

router
  .route('/:chatId/messages')
  .get(chatController.fetchMessages);

router
  .route('/:chatId/read')
  .put(chatController.markAsRead);

module.exports = router;
