const express = require('express');
const controller = require('../controllers/menuController');
const authenticate = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', authenticate, isAdmin, controller.save);
router.put('/:id', authenticate, isAdmin, controller.save);
router.delete('/:id', authenticate, isAdmin, controller.remove);

module.exports = router;
