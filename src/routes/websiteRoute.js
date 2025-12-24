const express = require('express');
const router = express.Router();
const { submitContactMessage, subscribeNewsletter } = require('../controllers/websiteController');

router.post('/contact', submitContactMessage);
router.post('/subscribe', subscribeNewsletter);

module.exports = router;
