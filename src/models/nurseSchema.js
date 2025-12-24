const mongoose = require("mongoose");

const nurseDetailSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
        trim: true
    },
    shift: [{
        day: {
            type: String,
            enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
            required: true
        },
        startTime: { type: String, required: true }, 
        endTime: { type: String, required: true }  
    }],
}, { timestamps: true });

module.exports = mongoose.model("NurseDetail", nurseDetailSchema);
