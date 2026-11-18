const express = require('express');
const { signup, login, me } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

const { signupLimit, loginLimit } = require('../middleware/authRateLimit');

const router = express.Router();

router.post('/signup', signupLimit, signup);
router.post('/login', loginLimit, login);
router.get('/me', authenticate, me);

module.exports = router;
