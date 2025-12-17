const express = require("express");
const {
    register,
    login,
    verifyEmail,
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser
} = require("../controllers/userController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);

// Authenticated user routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

// Admin only routes
router.get("/all", authenticate, authorizeRoles("admin"), getAllUsers);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteUser);

module.exports = router;
