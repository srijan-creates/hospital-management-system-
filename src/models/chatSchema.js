const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({

    sessionId: {
        type: String,
        required: true,
        index: true,
    },

    role: {
        type: String,
        required: true,
        enum: ['user', 'bot']
    },

    content: {
        type: String,
        required: true,
        trim: true,

    },


    intent: {
        type: String,
        default: null,
    },

}, {
    timestamps: true
});


chatSchema.index({ sessionId: 1, createdAt: -1 });


module.exports = mongoose.model("Chat", chatSchema);
