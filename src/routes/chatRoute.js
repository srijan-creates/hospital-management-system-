const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  updateSessionInfo
} = require('../controllers/chatController');

// Import middleware
const { rateLimiters } = require('../middleware/rateLimitMiddleware');
const {
  validateSendMessage,
  validateGetHistory,
  validateSessionInfo
} = require('../middleware/chatValidationMiddleware');

router.post('/send',
  rateLimiters.chatMessage,
  validateSendMessage,
  sendMessage
);

router.get('/history',
  rateLimiters.chatHistory,
  validateGetHistory,
  getChatHistory
);

router.post('/session-info',
  rateLimiters.sessionUpdate,
  validateSessionInfo,
  updateSessionInfo
);

module.exports = router;