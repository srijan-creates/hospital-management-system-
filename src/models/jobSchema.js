const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Temporary']
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    description: {
        type: String,
    },
    requirements: {
        type: [String],
        default: []
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    isOpen: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Job', jobSchema);
