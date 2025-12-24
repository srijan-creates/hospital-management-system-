const { verifyJWT } = require("../utils/generateToken");
const User = require("../models/userSchema");

async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = await verifyJWT(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        const user = await User.findOne({ email: decoded.email })
            .populate({
                path: "role",
                populate: {
                    path: "permissions"
                }
            })
            .populate("profile")
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before accessing this resource"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authentication failed",
            error: error.message
        });
    }
}

module.exports = { authenticate };
