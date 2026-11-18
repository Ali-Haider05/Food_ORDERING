const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const runCatalogWrite = require('../config/catalogWrites');

const writableFields = new Set(['name', 'description', 'price', 'image', 'category', 'available']);

function validCategoryId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9]{16}$/.test(value);
}

function validImage(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());
    return Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function positiveInteger(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return NaN;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : NaN;
}

async function list(request, response) {
  const { page = '1', limit = '10', search, category, available } = request.query;
  const pageNumber = positiveInteger(page);
  const pageSize = positiveInteger(limit);
  const offset = (pageNumber - 1) * pageSize;

  if (!Number.isSafeInteger(offset) || pageSize > 100) {
    return response.status(400).json({ success: false, message: 'Page and limit must be positive integers; limit cannot exceed 100' });
  }
  if ((category !== undefined && !validCategoryId(category)) ||
      (available !== undefined && available !== 'true' && available !== 'false') ||
      (search !== undefined && (typeof search !== 'string' || !search.trim()))) {
    return response.status(400).json({ success: false, message: 'Invalid menu filter' });
  }

  const query = {};
  if (search !== undefined) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');
    query.$or = [{ name: pattern }, { description: pattern }];
  }
  if (category !== undefined) query.category = category;
  if (available !== undefined) query.available = available === 'true';

  // Read the count and page while catalog writes are paused.
  const [total, items] = await runCatalogWrite(() => Promise.all([
    MenuItem.count(query), MenuItem.list(query, offset, pageSize),
  ]));
  return response.status(200).json({
    success: true,
    items: items.map(MenuItem.publicItem),
    pagination: { page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

function notFound(response) {
  return response.status(404).json({ success: false, message: 'Menu item not found' });
}

async function get(request, response) {
  const item = await MenuItem.findById(request.params.id);
  if (!item) return notFound(response);
  return response.status(200).json({ success: true, item: MenuItem.publicItem(item) });
}

async function save(request, response) {
  const { id } = request.params;
  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some((key) => !writableFields.has(key))) {
    return response.status(400).json({ success: false, message: 'Unexpected or protected menu item fields' });
  }

  const { name, description, price, image, category, available } = body;
  if (typeof name !== 'string' || !name.trim() || typeof description !== 'string' || !description.trim() ||
      !Number.isFinite(price) || price <= 0 || !validImage(image) || !validCategoryId(category) ||
      (available !== undefined && typeof available !== 'boolean')) {
    return response.status(400).json({ success: false, message: 'Invalid menu item data' });
  }

  const fields = { name: name.trim(), description: description.trim(), price, image: image.trim(), category };
  if (available !== undefined) fields.available = available;

  const result = await runCatalogWrite(async () => {
    if (id && !(await MenuItem.findById(id))) return { status: 404 };
    if (!(await Category.findById(category))) return { status: 400 };
    const item = id ? await MenuItem.update(id, fields) : await MenuItem.create(fields);
    return { status: id ? 200 : 201, item };
  });

  if (result.status === 404) return notFound(response);
  if (result.status === 400) {
    return response.status(400).json({ success: false, message: 'Category does not exist' });
  }
  return response.status(result.status).json({ success: true, item: MenuItem.publicItem(result.item) });
}

async function remove(request, response) {
  const removed = await runCatalogWrite(() => MenuItem.remove(request.params.id));
  if (!removed) return notFound(response);
  return response.status(200).json({ success: true, message: 'Menu item deleted' });
}

module.exports = { list, get, save, remove };
