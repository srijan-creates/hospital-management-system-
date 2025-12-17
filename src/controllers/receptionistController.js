const Receptionist = require("../models/receptionistSchema");
const User = require("../models/userSchema");

/**
 * Create or Update Receptionist Profile
 */
async function createOrUpdateReceptionistProfile(req, res) {
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

        let receptionist;
        if (user.profile) {
            receptionist = await Receptionist.findByIdAndUpdate(
                user.profile,
                {
                    department,
                    shift: shifts || []
                },
                { new: true, runValidators: true }
            );
        } else {
            receptionist = await Receptionist.create({
                department,
                shift: shifts || []
            });

            user.profile = receptionist._id;
            user.profileModel = "ReceptionistDetail";
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: user.profile ? "Receptionist profile updated successfully" : "Receptionist profile created successfully",
            receptionist
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
 * Get Receptionist Profile
 */
async function getReceptionistProfile(req, res) {
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
                message: "Receptionist profile not found. Please create a profile first."
            });
        }

        return res.status(200).json({
            success: true,
            receptionist: user.profile
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
 * Get All Receptionists
 */
async function getAllReceptionists(req, res) {
    try {
        const receptionists = await Receptionist.find();

        return res.status(200).json({
            success: true,
            count: receptionists.length,
            receptionists
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
 * Get Receptionist by ID
 */
async function getReceptionistById(req, res) {
    try {
        const { id } = req.params;

        const receptionist = await Receptionist.findById(id);

        if (!receptionist) {
            return res.status(404).json({
                success: false,
                message: "Receptionist not found"
            });
        }

        const user = await User.findOne({ profile: id }).select("-password");

        return res.status(200).json({
            success: true,
            receptionist,
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
 * Update Receptionist Shifts
 */
async function updateReceptionistShifts(req, res) {
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
                message: "Receptionist profile not found"
            });
        }

        const receptionist = await Receptionist.findByIdAndUpdate(
            user.profile,
            { shift: shifts },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Receptionist shifts updated successfully",
            receptionist
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
 * Delete Receptionist Profile
 */
async function deleteReceptionistProfile(req, res) {
    try {
        const { id } = req.params;

        const receptionist = await Receptionist.findByIdAndDelete(id);

        if (!receptionist) {
            return res.status(404).json({
                success: false,
                message: "Receptionist not found"
            });
        }

        await User.findOneAndUpdate(
            { profile: id },
            { $unset: { profile: "", profileModel: "" } }
        );

        return res.status(200).json({
            success: true,
            message: "Receptionist profile deleted successfully"
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
    createOrUpdateReceptionistProfile,
    getReceptionistProfile,
    getAllReceptionists,
    getReceptionistById,
    updateReceptionistShifts,
    deleteReceptionistProfile
};
