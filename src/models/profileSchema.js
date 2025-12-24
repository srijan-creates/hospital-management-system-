const mongoose =require("mongoose");

const profileSchema = new mongoose.Schema({

    name: {
        type:String,
        required:true,
        trim:true,
        maxlength: 50,
        unique:true,
    },

    detail:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"profileDetail",
    },

    profileDetail:{
        type:String,
        required:true,
    },
}, {timestamps: true});

module.exports = mongoose.model("Profile", profileSchema);