const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

async function stats(_request, response) {
  const [orders, totalUsers, totalMenuItems] = await Promise.all([
    Order.stats(), User.count(), MenuItem.count({}),
  ]);
  return response.status(200).json({ success: true, stats: { ...orders, totalUsers, totalMenuItems } });
}

module.exports = { stats };
