const express = require("express");
const {
    createOrUpdatePatientProfile,
    getPatientProfile,
    getAllPatients,
    getPatientById,
    updateMedicalInfo,
    updateEmergencyContact,
    deletePatientProfile
} = require("../controllers/patientController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Patient profile routes (authenticated patient only)
router.post("/profile", authenticate, authorizeRoles("patient"), createOrUpdatePatientProfile);
router.get("/profile", authenticate, authorizeRoles("patient"), getPatientProfile);
router.put("/medical-info", authenticate, authorizeRoles("patient"), updateMedicalInfo);
router.put("/emergency-contact", authenticate, authorizeRoles("patient"), updateEmergencyContact);

// Admin/Staff routes (admin, doctor, nurse can view patients)
router.get("/", authenticate, authorizeRoles("admin", "doctor", "nurse"), getAllPatients);
router.get("/:id", authenticate, authorizeRoles("admin", "doctor", "nurse"), getPatientById);
router.delete("/:id", authenticate, authorizeRoles("admin"), deletePatientProfile);

module.exports = router;

