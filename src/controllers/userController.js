const User = require("../models/userSchema");
const Role = require("../models/roleSchema");
const bcrypt = require("bcrypt");

const { generateJWT, verifyJWT } = require("../utils/generateToken");

const { generateHash, otpVerify } = require("../utils/generateOtp");
const { verificationMail, accountCreatedMail, verifyOTPMail } = require("../utils/sendEmail");

async function register(req, res) {
    try {
        const { name, email, password, phone, gender } =
            req.body;

        if (!name || !email || !password)
            return res.status(400).json({
                success: false,
                message: "Please fill all the required fields",
            });

        // DEBUG: Log the registration attempt
        console.log("\n" + "=".repeat(60));
        console.log("📝 REGISTRATION ATTEMPT");
        console.log("=".repeat(60));
        console.log("Email:", email);
        console.log("Name:", name);
        console.log("Database:", process.env.MONGO_URI);
        console.log("Checking for existing user...");

        // Check for existing user
        const checkUser = await User.findOne({ email }).populate("role");

        console.log("Query result:", checkUser ? "USER FOUND" : "NO USER FOUND");
        if (checkUser) {
            console.log("Existing user details:");
            console.log("  - ID:", checkUser._id);
            console.log("  - Email:", checkUser.email);
            console.log("  - Name:", checkUser.name);
            console.log("  - Created:", checkUser.createdAt);
        }
        console.log("=".repeat(60) + "\n");

        if (checkUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered with this email",
            });
        }

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
            phone: phone || undefined,
            gender: gender || undefined,
            password: hashedPassword,
            role: patientRole._id,
            profileModel: "Patient",
        });

        console.log(`New user created: ${newUser.email} (ID: ${newUser._id})`);

        // Handle email verification
        if (req.user && (req.user.role.name === 'admin' || req.user.role.name === 'receptionist')) {
            console.log(`Admin/Receptionist creating account for: ${newUser.email}`);
            const emailSent = await accountCreatedMail(newUser.email, {
                name: newUser.name,
                email: newUser.email,
                password: password
            });

            if (!emailSent) {
                console.error(`Failed to send account creation email to ${newUser.email}`);
            }

            newUser.isVerified = true;
            await newUser.save();
        } else {
            console.log(`Sending verification email to: ${newUser.email}`);
            const token = await generateJWT({ id: newUser._id });
            const emailSent = await verificationMail(newUser.email, token);

            if (!emailSent) {
                console.error(`Failed to send verification email to ${newUser.email}`);
                // Still return success but warn user
                return res.status(201).json({
                    success: true,
                    message: "User registered successfully! However, there was an issue sending the verification email. Please contact support.",
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        phone: newUser.phone,
                        email: newUser.email,
                        gender: newUser.gender,
                        role: patientRole.name,
                    },
                    emailWarning: true
                });
            }
            console.log(`Verification email sent successfully to ${newUser.email}`);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully! Please check your email for verification.",
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
        console.error("Registration error:", error);

        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User already registered with this email",
            });
        }

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

        const checkUser = await User.findOne({ email }).select("+password");

        if (!checkUser)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, checkUser.password);

        if (!isMatch)
            return res
                .status(400)
                .json({ success: false, message: "Incorrect email or password" });

        // Generate OTP
        const phoneForHash = checkUser.phone || email;

        console.log("=".repeat(60));
        console.log("🔐 LOGIN OTP GENERATION");
        console.log("=".repeat(60));
        console.log("User:", email);
        console.log("Phone for hash:", phoneForHash);

        const { otp, hash } = generateHash(phoneForHash);
        console.log(`Generated OTP: ${otp}`);
        console.log("Hash created successfully");

        // Check if email configuration is available
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
            console.error("❌ SMTP credentials not configured!");
            return res.status(500).json({
                success: false,
                message: "Email service is not configured. Please contact the administrator.",
            });
        }

        console.log("Attempting to send OTP email to:", checkUser.email);
        const emailSent = await verifyOTPMail(checkUser.email, otp);

        if (!emailSent) {
            console.error(`❌ Failed to send OTP email to ${checkUser.email}`);
            console.error("Possible causes:");
            console.error("  1. Invalid SMTP credentials");
            console.error("  2. Gmail App Password not configured correctly");
            console.error("  3. Network/firewall issues");
            console.error("  4. Gmail security settings blocking the app");
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email. Please check your email configuration or try again later.",
            });
        }

        console.log(`✅ OTP email sent successfully to ${checkUser.email}`);
        console.log("=".repeat(60));

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email",
            otpSent: true,
            email: checkUser.email,
            phone: phoneForHash,
            hash
        });

    } catch (error) {
        console.error("=".repeat(60));
        console.error("❌ LOGIN ERROR");
        console.error("=".repeat(60));
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("=".repeat(60));
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

async function verifyLoginOtp(req, res) {
    try {
        const { email, otp, hash, phone } = req.body;

        if (!email || !otp || !hash || !phone) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const verifyResult = otpVerify(otp, hash, phone);

        if (!verifyResult.success) {
            return res.status(400).json({ success: false, message: verifyResult.message || "Invalid OTP" });
        }

        // OTP Verified, now return Token
        const user = await User.findOne({ email })
            .populate({
                path: "role",
                populate: {
                    path: "permissions",
                },
            })
            .populate("profile");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const token = await generateJWT({ email });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                role: user.role,
                profile: user.profile,
                profileModel: user.profileModel,
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
    verifyLoginOtp
};
