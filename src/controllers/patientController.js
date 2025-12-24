const Patient = require("../models/patientSchema");
const User = require("../models/userSchema");

async function createOrUpdatePatientProfile(req, res) {
    try {
        const userId = req.user._id;
        const {
            DOB,
            Gender,
            BloodGroup,
            Allergies,
            Medications,
            emergencyContact,
            emergencyRelation
        } = req.body;

        if (!DOB || !Gender) {
            return res.status(400).json({
                success: false,
                message: "DOB and Gender are required fields"
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let patient;
        if (user.profile) {
            patient = await Patient.findByIdAndUpdate(
                user.profile,
                {
                    personalInfo: {
                        DOB: new Date(DOB),
                        Gender,
                        BloodGroup
                    },
                    medicalInfo: Allergies || Medications ? [{
                        Allergies,
                        Medications: Medications || []
                    }] : [],
                    emergencyInfo: emergencyContact ? [{
                        contact: emergencyContact,
                        relation: emergencyRelation
                    }] : []
                },
                { new: true, runValidators: true }
            );
        } else {
            patient = await Patient.create({
                personalInfo: {
                    DOB: new Date(DOB),
                    Gender,
                    BloodGroup
                },
                medicalInfo: Allergies || Medications ? [{
                    Allergies,
                    Medications: Medications || []
                }] : [],
                emergencyInfo: emergencyContact ? [{
                    contact: emergencyContact,
                    relation: emergencyRelation
                }] : []
            });

            user.profile = patient._id;
            user.profileModel = "Patient";
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: user.profile ? "Patient profile updated successfully" : "Patient profile created successfully",
            patient
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function getPatientProfile(req, res) {
    try {
        const userId = req.user._id; 

        const user = await User.findById(userId).populate("profile");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.profile) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found. Please create a profile first."
            });
        }

        return res.status(200).json({
            success: true,
            patient: user.profile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function getAllPatients(req, res) {
    try {
        const patients = await Patient.find();

        return res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function getPatientById(req, res) {
    try {
        const { id } = req.params;

        const patient = await Patient.findById(id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const user = await User.findOne({ profile: id }).select("-password");

        return res.status(200).json({
            success: true,
            patient,
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function updateMedicalInfo(req, res) {
    try {
        const userId = req.user._id;
        const { Allergies, Medications } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.profile) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        const patient = await Patient.findByIdAndUpdate(
            user.profile,
            {
                medicalInfo: [{
                    Allergies,
                    Medications: Medications || []
                }]
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Medical information updated successfully",
            patient
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function updateEmergencyContact(req, res) {
    try {
        const userId = req.user._id;
        const { contact, relation } = req.body;

        if (!contact || !relation) {
            return res.status(400).json({
                success: false,
                message: "Contact and relation are required"
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.profile) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        const patient = await Patient.findByIdAndUpdate(
            user.profile,
            {
                emergencyInfo: [{
                    contact,
                    relation
                }]
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Emergency contact updated successfully",
            patient
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function deletePatientProfile(req, res) {
    try {
        const { id } = req.params;

        const patient = await Patient.findByIdAndDelete(id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        await User.findOneAndUpdate(
            { profile: id },
            { $unset: { profile: "", profileModel: "" } }
        );

        return res.status(200).json({
            success: true,
            message: "Patient profile deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports = {
    createOrUpdatePatientProfile,
    getPatientProfile,
    getAllPatients,
    getPatientById,
    updateMedicalInfo,
    updateEmergencyContact,
    deletePatientProfile
};