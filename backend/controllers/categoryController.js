const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const runCatalogWrite = require('../config/catalogWrites');

async function list(_request, response) {
  const categories = await Category.list();
  return response.status(200).json({ success: true, categories: categories.map(Category.publicCategory) });
}

async function save(request, response) {
  const { id } = request.params;
  const name = request.body?.name;
  if (typeof name !== 'string' || !name.trim()) {
    return response.status(400).json({ success: false, message: 'Category name is required' });
  }

  let category;
  try {
    category = id ? await Category.update(id, name) : await Category.create(name);
  } catch (error) {
    if (error.errorType === 'uniqueViolated' && error.key === name.trim().toLowerCase()) {
      return response.status(409).json({ success: false, message: 'Category name already exists' });
    }
    throw error;
  }

  if (!category) {
    return response.status(404).json({ success: false, message: 'Category not found' });
  }
  return response.status(id ? 200 : 201).json({ success: true, category: Category.publicCategory(category) });
}

async function remove(request, response) {
  const { id } = request.params;
  const status = await runCatalogWrite(async () => {
    if (await MenuItem.hasCategory(id)) return 409;
    return (await Category.remove(id)) ? 200 : 404;
  });

  if (status === 409) {
    return response.status(409).json({ success: false, message: 'Category is referenced by menu items' });
  }
  if (status === 404) {
    return response.status(404).json({ success: false, message: 'Category not found' });
  }
  return response.status(200).json({ success: true, message: 'Category deleted' });
}

module.exports = { list, save, remove };
