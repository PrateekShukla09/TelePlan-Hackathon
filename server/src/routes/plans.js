const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateJWT } = require('../middleware/auth');

router.get('/', planController.getAllPlans);
router.post('/', authenticateJWT, planController.createPlan);
router.put('/:id', authenticateJWT, planController.updatePlan);
router.delete('/:id', authenticateJWT, planController.deletePlan);

module.exports = router;
