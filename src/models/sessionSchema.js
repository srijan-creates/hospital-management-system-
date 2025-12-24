const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  endedAt: Date,

  lastActivity: {
    type: Date,
    default: Date.now
  },

  userInfo: {
    name: String,
    email: String,
    phone: String,
    collectedAt: Date
  },


  totalMessages: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['active', 'ended', 'transferred'],
    default: 'active'
  }
});

module.exports = mongoose.model('Session', SessionSchema);