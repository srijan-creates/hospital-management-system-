const mongoose = require("mongoose");

const doctorDetailSchema = new mongoose.Schema({
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    shift: {
        day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            required: true
        },
        startTime: {
            type: String, 
            required: true
        },
        endTime: {
            type: String, 
            required: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorDetailSchema);
