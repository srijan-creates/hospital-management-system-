const Nurse = require("../models/nurseSchema");
const User = require("../models/userSchema");

/**
 * Create or Update Nurse Profile
 */
async function createOrUpdateNurseProfile(req, res) {
    try {
        const userId = req.user._id;
        const { department, shifts } = req.body;

        if (!department) {
            return res.status(400).json({
                success: false,
                message: "Department is required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let nurse;
        if (user.profile) {
            nurse = await Nurse.findByIdAndUpdate(
                user.profile,
                {
                    department,
                    shift: shifts || []
                },
                { new: true, runValidators: true }
            );
        } else {
            nurse = await Nurse.create({
                department,
                shift: shifts || []
            });

            user.profile = nurse._id;
            user.profileModel = "NurseDetail";
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: user.profile ? "Nurse profile updated successfully" : "Nurse profile created successfully",
            nurse
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
 * Get Nurse Profile
 */
async function getNurseProfile(req, res) {
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
                message: "Nurse profile not found. Please create a profile first."
            });
        }

        return res.status(200).json({
            success: true,
            nurse: user.profile
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
 * Get All Nurses
 */
async function getAllNurses(req, res) {
    try {
        const nurses = await Nurse.find();

        return res.status(200).json({
            success: true,
            count: nurses.length,
            nurses
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
 * Get Nurse by ID
 */
async function getNurseById(req, res) {
    try {
        const { id } = req.params;

        const nurse = await Nurse.findById(id);

        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: "Nurse not found"
            });
        }

        const user = await User.findOne({ profile: id }).select("-password");

        return res.status(200).json({
            success: true,
            nurse,
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
 * Update Nurse Shifts
 */
async function updateNurseShifts(req, res) {
    try {
        const userId = req.user._id;
        const { shifts } = req.body;

        if (!shifts || !Array.isArray(shifts)) {
            return res.status(400).json({
                success: false,
                message: "Shifts array is required"
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.profile) {
            return res.status(404).json({
                success: false,
                message: "Nurse profile not found"
            });
        }

        const nurse = await Nurse.findByIdAndUpdate(
            user.profile,
            { shift: shifts },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Nurse shifts updated successfully",
            nurse
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
 * Delete Nurse Profile
 */
async function deleteNurseProfile(req, res) {
    try {
        const { id } = req.params;

        const nurse = await Nurse.findByIdAndDelete(id);

        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: "Nurse not found"
            });
        }

        await User.findOneAndUpdate(
            { profile: id },
            { $unset: { profile: "", profileModel: "" } }
        );

        return res.status(200).json({
            success: true,
            message: "Nurse profile deleted successfully"
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
    createOrUpdateNurseProfile,
    getNurseProfile,
    getAllNurses,
    getNurseById,
    updateNurseShifts,
    deleteNurseProfile
};
