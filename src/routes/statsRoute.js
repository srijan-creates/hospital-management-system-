const express = require('express');
const router = express.Router();
const { getAdminStats, getDoctorStats, getReceptionistStats, getNurseStats } = require('../controllers/statsController');
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get('/admin', authenticate, authorizeRoles('admin'), getAdminStats);
router.get('/doctor', authenticate, authorizeRoles('doctor', 'admin'), getDoctorStats);
router.get('/receptionist', authenticate, authorizeRoles('receptionist', 'admin'), getReceptionistStats);
router.get('/nurse', authenticate, authorizeRoles('nurse', 'admin'), getNurseStats);

module.exports = router;
