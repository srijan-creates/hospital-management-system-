const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    dischargeDate: Date,
    status: {
        type: String,
        enum: ['Admitted', 'Discharged', 'Pending Discharge'],
        default: 'Admitted'
    },
    ward: {
        type: String, 
        required: true
    },
    bedNumber: String
});

module.exports = mongoose.model('Admission', admissionSchema);
