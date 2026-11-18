const express = require('express');
const controller = require('../controllers/orderController');
const authenticate = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);
router.post('/', controller.place);
router.get('/my', controller.myOrders);
router.get('/', isAdmin, controller.allOrders);
router.put('/:id/status', isAdmin, controller.changeStatus);

module.exports = router;
