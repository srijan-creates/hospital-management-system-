const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  personalInfo: {
    DOB: {
      type: Date,
      required: true
    },
    Gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Others"]
    },
    BloodGroup: {
      type: String,
      enum: ["A+", "A-", "AB+", "AB-", "B+", "B-", "O+", "O-"]
    }
  },

  medicalInfo: [{
    Allergies: { type: String },
    Medications: [{ type: String }]
  }],

  emergencyInfo: [{
    contact: { type: String },
    relation: { type: String }
  }]

}, { timestamps: true });

patientSchema.virtual("age").get(function() {
  const today = new Date();
  const birthDate = this.personalInfo.DOB;
  if (!birthDate) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  return age;
});

module.exports = mongoose.model("Patient", patientSchema);
