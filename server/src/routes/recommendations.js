const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { recommendationLimiter } = require('../middleware/rateLimiter');

router.use(recommendationLimiter);

router.post('/by-customer/:id', recommendationController.recommendByCustomer);
router.post('/by-profile', recommendationController.recommendByProfile);

module.exports = router;
