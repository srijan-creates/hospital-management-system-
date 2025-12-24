const express = require('express');
const router = express.Router();
const {
    getAllSessions,
    getSessionById,
    getSessionsByStatus,
    updateSessionStatus,
    deleteSession,
    getSessionAnalytics
} = require('../controllers/sessionController');

const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes require admin authentication
router.use(authenticate);
router.use(authorizeRoles('Admin', 'admin'));

router.get('/', getAllSessions);
router.get('/analytics', getSessionAnalytics);
router.get('/status/:status', getSessionsByStatus);
router.get('/:id', getSessionById);
router.put('/:id/status', updateSessionStatus);
router.delete('/:id', deleteSession);

module.exports = router;
