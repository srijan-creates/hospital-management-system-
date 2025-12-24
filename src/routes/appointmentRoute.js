const express = require("express");
const {
    createAppointment,
    getAllAppointments,
    getDoctorAppointments,
    getPatientAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment
} = require("../controllers/appointmentController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Patient routes
router.get("/patient", authenticate, authorizeRoles("patient"), getPatientAppointments);
router.post("/", authenticate, authorizeRoles("patient", "receptionist"), createAppointment);
router.put("/:id/cancel", authenticate, authorizeRoles("patient"), cancelAppointment);

// Doctor routes
router.get("/doctor", authenticate, authorizeRoles("doctor"), getDoctorAppointments);

// Receptionist/Admin routes
router.get("/", authenticate, authorizeRoles("admin", "receptionist"), getAllAppointments);
router.put("/:id/status", authenticate, authorizeRoles("admin", "receptionist", "doctor"), updateAppointmentStatus);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteAppointment);

module.exports = router;
