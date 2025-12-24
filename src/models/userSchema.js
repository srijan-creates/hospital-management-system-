const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    phone: {
        type: String,
        required: false,
    },

    gender: {
        type: String,
        required: true,
        enum: ["male", "female", "other"],
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    },

    profile: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "profileModel",
    },

    profileModel: {
        type: String,
        required: true,
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);