const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({

    keywords:[{
        type:String,
        lowercase:true,
        trim:true,
    }],

    response: {
        type:String,
    },

    language:{
        type:String,
        default: "en",
    },

    category:{
        type:String,
        enum: ['appointment', 'departments', 'hours', 'emergency', 'location', 'insurance', 'general'],
        default: 'general',
    },

    isActive:{
        type:Boolean,
        default: true,
    },

    priority:{
        type:Number,
        default: 0
    },
}, {timestamps:true});

module.exports = mongoose.model('Faq', faqSchema);