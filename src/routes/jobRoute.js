const express = require('express');
const router = express.Router();
const { getAllJobs, createJob } = require('../controllers/jobController');
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get('/', getAllJobs);

router.post('/', authenticate, authorizeRoles('Admin', 'admin'), createJob);

module.exports = router;
