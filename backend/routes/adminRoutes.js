const express = require('express');
const { stats } = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', authenticate, isAdmin, stats);

module.exports = router;
