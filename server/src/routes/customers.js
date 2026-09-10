const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/:id', customerController.getCustomerById);
router.get('/:id/usage', customerController.getCustomerUsage);

module.exports = router;
