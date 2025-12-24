const express = require("express");
const {
    createOrUpdateNurseProfile,
    getNurseProfile,
    getAllNurses,
    getNurseById,
    updateNurseShifts,
    deleteNurseProfile
} = require("../controllers/nurseController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Nurse profile routes (authenticated nurse only)
router.post("/profile", authenticate, authorizeRoles("nurse"), createOrUpdateNurseProfile);
router.get("/profile", authenticate, authorizeRoles("nurse"), getNurseProfile);
router.put("/shifts", authenticate, authorizeRoles("nurse"), updateNurseShifts);

// Admin/Staff routes
router.get("/", authenticate, authorizeRoles("admin", "doctor"), getAllNurses);
router.get("/:id", authenticate, authorizeRoles("admin", "doctor"), getNurseById);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteNurseProfile);

module.exports = router;
