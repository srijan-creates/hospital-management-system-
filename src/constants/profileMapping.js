const doctorSchema = require("../models/doctorSchema");
const nurseSchema = require("../models/nurseSchema");
const patientSchema = require("../models/patientSchema");
const receptionistSchema = require("../models/receptionistSchema");

const PROFILE_DETAIL_MAPPING = {
    Doctor: doctorSchema,
    Patient: patientSchema,
    Nurse: nurseSchema,
    Receptionist: receptionistSchema
};

module.exports = { PROFILE_DETAIL_MAPPING };
