const { verifyJWT } = require("../utils/generateToken");
const User = require("../models/userSchema");

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
async function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = await verifyJWT(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // Find user and populate role with permissions
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

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before accessing this resource"
            });
        }

        // Attach user to request
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
