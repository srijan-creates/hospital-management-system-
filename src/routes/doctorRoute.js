const express = require("express");
const {
    createOrUpdateDoctorProfile,
    getDoctorProfile,
    getAllDoctors,
    getDoctorById,
    updateDoctorShift,
    deleteDoctorProfile
} = require("../controllers/doctorController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Doctor profile routes (authenticated doctor only)
router.post("/profile", authenticate, authorizeRoles("doctor"), createOrUpdateDoctorProfile);
router.get("/profile", authenticate, authorizeRoles("doctor"), getDoctorProfile);
router.put("/shift", authenticate, authorizeRoles("doctor"), updateDoctorShift);

// Admin/Staff routes
router.get("/", authenticate, authorizeRoles("admin", "receptionist"), getAllDoctors);
router.get("/:id", authenticate, authorizeRoles("admin", "receptionist"), getDoctorById);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteDoctorProfile);

module.exports = router;
