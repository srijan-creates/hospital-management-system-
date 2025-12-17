const express = require("express");
const {
    createOrUpdateReceptionistProfile,
    getReceptionistProfile,
    getAllReceptionists,
    getReceptionistById,
    updateReceptionistShifts,
    deleteReceptionistProfile
} = require("../controllers/receptionistController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Receptionist profile routes (authenticated receptionist only)
router.post("/profile", authenticate, authorizeRoles("receptionist"), createOrUpdateReceptionistProfile);
router.get("/profile", authenticate, authorizeRoles("receptionist"), getReceptionistProfile);
router.put("/shifts", authenticate, authorizeRoles("receptionist"), updateReceptionistShifts);

// Admin routes
router.get("/", authenticate, authorizeRoles("admin"), getAllReceptionists);
router.get("/:id", authenticate, authorizeRoles("admin"), getReceptionistById);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteReceptionistProfile);

module.exports = router;
