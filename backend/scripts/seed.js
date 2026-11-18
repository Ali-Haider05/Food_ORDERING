const path = require('node:path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const catalog = {
  Burgers: [
    ['Classic Cheeseburger', 'Grilled beef, cheddar, and house sauce.', 8.5],
    ['Crispy Chicken Burger', 'Breaded chicken, lettuce, and pickles.', 8],
    ['Mushroom Burger', 'Grilled mushrooms, Swiss cheese, and onions.', 9],
  ],
  Pizza: [
    ['Margherita Pizza', 'Tomato sauce, mozzarella, and basil.', 10],
    ['Pepperoni Pizza', 'Pepperoni, mozzarella, and tomato sauce.', 12],
    ['Garden Pizza', 'Bell peppers, olives, onions, and mozzarella.', 11],
  ],
  Sides: [
    ['Sea Salt Fries', 'Golden fries tossed with sea salt.', 3.5],
    ['Onion Rings', 'Crisp battered onion rings.', 4],
    ['Coleslaw', 'Shredded cabbage and carrots in a creamy dressing.', 3],
  ],
  Drinks: [
    ['Lemonade', 'Lemon juice, water, and a touch of sugar.', 3],
    ['Iced Tea', 'Chilled black tea served over ice.', 2.75],
    ['Sparkling Water', 'Chilled carbonated mineral water.', 2.5],
  ],
  Desserts: [
    ['Chocolate Brownie', 'Rich chocolate brownie with a fudgy center.', 4.5],
    ['Vanilla Ice Cream', 'Two scoops of vanilla ice cream.', 4],
    ['Apple Crumble', 'Baked apples topped with a buttery oat crumble.', 5],
  ],
};

function adminCredentials() {
  const name = (process.env.ADMIN_NAME ?? 'Administrator').trim();
  const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? '';
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      [...password].length < 12 || Buffer.byteLength(password, 'utf8') > 72 || !password.trim()) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12 characters minimum, 72 UTF-8 bytes maximum), and keep ADMIN_NAME nonempty.');
  }
  return { name, email, password };
}

async function seed() {
  const credentials = adminCredentials();
  const User = require('../models/User');
  const Category = require('../models/Category');
  const MenuItem = require('../models/MenuItem');
  await Promise.all([User.ready, Category.ready, MenuItem.ready]);

  const existing = await User.findByEmail(credentials.email);
  if (existing && existing.role !== 'admin') {
    throw new Error('ADMIN_EMAIL belongs to a non-admin account; use a different email.');
  }
  if (!existing) {
    const password = await bcrypt.hash(credentials.password, 12);
    await User.createAdmin({ ...credentials, password });
  }

  let categoryCount = 0;
  let itemCount = 0;
  for (const [name, items] of Object.entries(catalog)) {
    let category = await Category.findByName(name);
    if (!category) {
      category = await Category.create(name);
      categoryCount += 1;
    }

    for (const [itemName, description, price] of items) {
      if (await MenuItem.findByNameInCategory(itemName, category._id)) continue;
      await MenuItem.create({
        name: itemName,
        description,
        price,
        image: 'https://placehold.co/640x480/png?text=' + encodeURIComponent(itemName),
        category: category._id,
      });
      itemCount += 1;
    }
  }
  console.log('Seed complete. Admin created: %d. Categories created: %d. Menu items created: %d.',
    existing ? 0 : 1, categoryCount, itemCount);
}

seed().catch((error) => {
  // NeDB errors may include record contents, so only print expected configuration errors.
  const message = error.message?.startsWith('Set ADMIN_EMAIL') || error.message?.startsWith('ADMIN_EMAIL belongs')
    ? error.message
    : 'Check that DATA_DIR is writable and that no other process is using its NeDB files.';
  console.error('Seed failed:', message);
  process.exitCode = 1;
});
