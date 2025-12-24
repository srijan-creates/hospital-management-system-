const express = require('express');
const router = express.Router();
const {
    getAllFaqs,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
    getFaqsByCategory
} = require('../controllers/faqController');

const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public routes (for getting active FAQs)
router.get('/category/:category', getFaqsByCategory);

// Protected routes (admin only)
router.get('/', authenticate, authorizeRoles('Admin', 'admin'), getAllFaqs);
router.get('/:id', authenticate, authorizeRoles('Admin', 'admin'), getFaqById);
router.post('/', authenticate, authorizeRoles('Admin', 'admin'), createFaq);
router.put('/:id', authenticate, authorizeRoles('Admin', 'admin'), updateFaq);
router.delete('/:id', authenticate, authorizeRoles('Admin', 'admin'), deleteFaq);

module.exports = router;
