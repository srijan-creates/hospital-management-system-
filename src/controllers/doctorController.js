const Doctor = require("../models/doctorSchema");
const User = require("../models/userSchema");

/**
 * Create or Update Doctor Profile
 */
async function createOrUpdateDoctorProfile(req, res) {
    try {
        const userId = req.user._id;
        const { specialization, licenseNumber, day, startTime, endTime } = req.body;

        if (!specialization || !licenseNumber) {
            return res.status(400).json({
                success: false,
                message: "Specialization and license number are required fields"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let doctor;
        if (user.profile) {
            doctor = await Doctor.findByIdAndUpdate(
                user.profile,
                {
                    specialization,
                    licenseNumber,
                    shift: day && startTime && endTime ? {
                        day,
                        startTime,
                        endTime
                    } : undefined
                },
                { new: true, runValidators: true }
            );
        } else {
            doctor = await Doctor.create({
                specialization,
                licenseNumber,
                shift: {
                    day: day || "Monday",
                    startTime: startTime || "09:00",
                    endTime: endTime || "17:00"
                }
            });

            user.profile = doctor._id;
            user.profileModel = "Doctor";
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: user.profile ? "Doctor profile updated successfully" : "Doctor profile created successfully",
            doctor
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

/**
 * Get Doctor Profile
 */
async function getDoctorProfile(req, res) {
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
                message: "Doctor profile not found. Please create a profile first."
            });
        }

        return res.status(200).json({
            success: true,
            doctor: user.profile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

/**
 * Get All Doctors
 */
async function getAllDoctors(req, res) {
    try {
        const doctors = await Doctor.find();

        return res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

/**
 * Get Doctor by ID
 */
async function getDoctorById(req, res) {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        const user = await User.findOne({ profile: id }).select("-password");

        return res.status(200).json({
            success: true,
            doctor,
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

/**
 * Update Doctor Shift
 */
async function updateDoctorShift(req, res) {
    try {
        const userId = req.user._id;
        const { day, startTime, endTime } = req.body;

        if (!day || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Day, start time, and end time are required"
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.profile) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            user.profile,
            {
                shift: { day, startTime, endTime }
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Doctor shift updated successfully",
            doctor
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

/**
 * Delete Doctor Profile
 */
async function deleteDoctorProfile(req, res) {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByIdAndDelete(id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        await User.findOneAndUpdate(
            { profile: id },
            { $unset: { profile: "", profileModel: "" } }
        );

        return res.status(200).json({
            success: true,
            message: "Doctor profile deleted successfully"
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
    createOrUpdateDoctorProfile,
    getDoctorProfile,
    getAllDoctors,
    getDoctorById,
    updateDoctorShift,
    deleteDoctorProfile
};
