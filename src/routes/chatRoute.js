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

// Optional: Import auth middleware if you want to protect certain routes
// const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/chats/send
 * @desc    Send a message to the chatbot
 * @access  Public (or Protected if you uncomment authenticate middleware)
 * @middleware
 *   - rateLimiters.chatMessage: Limits to 10 messages per minute
 *   - validateSendMessage: Validates and sanitizes message content
 */
router.post('/send',
  rateLimiters.chatMessage,
  validateSendMessage,
  sendMessage
);

/**
 * @route   GET /api/chats/history
 * @desc    Get chat history for a session
 * @access  Public (or Protected if you uncomment authenticate middleware)
 * @middleware
 *   - rateLimiters.chatHistory: Limits to 30 requests per minute
 *   - validateGetHistory: Validates session ID and pagination params
 */
router.get('/history',
  rateLimiters.chatHistory,
  validateGetHistory,
  getChatHistory
);

/**
 * @route   POST /api/chats/session-info
 * @desc    Update session information (user details)
 * @access  Public (or Protected if you uncomment authenticate middleware)
 * @middleware
 *   - rateLimiters.sessionUpdate: Limits to 5 updates per minute
 *   - validateSessionInfo: Validates user information fields
 */
router.post('/session-info',
  rateLimiters.sessionUpdate,
  validateSessionInfo,
  updateSessionInfo
);

module.exports = router;