const User = require("../models/userSchema");
const Role = require("../models/roleSchema");
const bcrypt = require("bcrypt");

const { generateJWT, verifyJWT } = require("../utils/generateToken");

const { verificationMail, accountCreatedMail } = require("../utils/sendEmail");

async function register(req, res) {
    try {
        const { name, email, password, phone, gender } =
            req.body;

        if (!name || !email || !password)
            return res.status(400).json({
                success: false,
                message: "Please fill all the required fields",
            });

        const checkUser = await User.findOne({ email }).populate("role");

        if (checkUser)
            return res.status(400).json({
                success: false,
                message: "User already registered with this email",
            });

        const hashedPassword = await bcrypt.hash(password, 10);

        const patientRole = await Role.findOne({ name: "patient" });

        if (!patientRole) {
            return res.status(500).json({
                success: false,
                message: "Default Patient role not found. Please run seedRoles script.",
            });
        }

        const newUser = await User.create({
            name,
            email,
            phone,
            gender,
            password: hashedPassword,
            role: patientRole._id,
            profileModel: "Patient",
        });

        if (req.user && (req.user.role.name === 'admin' || req.user.role.name === 'receptionist')) {
            await accountCreatedMail(newUser.email, {
                name: newUser.name,
                email: newUser.email,
                password: password
            });
            newUser.isVerified = true;
            await newUser.save();
        } else {
            const token = await generateJWT({ id: newUser._id });
            await verificationMail(newUser.email, token);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            user: {
                id: newUser._id,
                name: newUser.name,
                phone: newUser.phone,
                email: newUser.email,
                gender: newUser.gender,
                role: patientRole.name,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({
                success: false,
                message: "Please fill all the required fields",
            });

        const checkUser = await User.findOne({ email })
            .select("+password")
            .populate({
                path: "role",
                populate: {
                    path: "permissions",
                },
            })
            .populate("profile");

        if (!checkUser)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, checkUser.password);

        if (!isMatch)
            return res
                .status(400)
                .json({ success: false, message: "Incorrect email or password" });

        const token = await generateJWT({ email });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            token,
            user: {
                id: checkUser._id,
                name: checkUser.name,
                email: checkUser.email,
                phone: checkUser.phone,
                gender: checkUser.gender,
                role: checkUser.role,
                profile: checkUser.profile,
                profileModel: checkUser.profileModel,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}


async function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        if (!token)
            return res.status(404).json({ success: false, message: "Invalid or expired token" });

        const decoded = await verifyJWT(token);

        const user = await User.findById(decoded.id);

        if (!user)
            return res.status(404).json({ successl: false, message: "User not found!" });

        user.isVerified = true;
        await user.save();

        return res.status(200).json({ success: true, message: "User verified successfully!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}
async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: "role",
                populate: {
                    path: "permissions",
                },
            })
            .populate("profile")
            .select("-password");

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}


async function updateProfile(req, res) {
    try {
        const { name, phone, email, gender, password, newPassword } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password",
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;
        if (gender) updateData.gender = gender;

        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        )
            .populate("role")
            .populate("profile")
            .select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}


async function getAllUsers(req, res) {
    try {
        const { role } = req.query;
        let query = {};

        if (role) {
            const roleDoc = await Role.findOne({ name: role });
            if (roleDoc) {
                query.role = roleDoc._id;
            } else {
                return res.status(200).json({
                    success: true,
                    count: 0,
                    users: [],
                });
            }
        }

        const users = await User.find(query)
            .populate("role")
            .populate("profile")
            .select("-password");

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { roleId } = req.body;

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        const user = await User.findByIdAndUpdate(id, { role: roleId }, { new: true }).populate("role");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: `User role updated to ${role.name}`,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser,
    updateUserRole,
    verifyEmail,
};
