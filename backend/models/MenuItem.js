const createDatastore = require('../config/db');

const menu = createDatastore('menu.db');

function publicItem(item) {
  const { _id, name, description, price, image, category, available, createdAt, updatedAt } = item;
  return { id: _id, name, description, price, image, category, available, createdAt, updatedAt };
}

function findById(id) {
  return menu.findOneAsync({ _id: id });
}

function hasCategory(category) {
  return menu.findOneAsync({ category });
}

function findByNameInCategory(name, category) {
  return menu.findOneAsync({ name, category });
}

function count(query) {
  return menu.countAsync(query).execAsync();
}

function list(query, offset, limit) {
  return menu.findAsync(query).sort({ createdAt: -1, _id: 1 }).skip(offset).limit(limit).execAsync();
}

function create(fields) {
  const now = new Date().toISOString();
  return menu.insertAsync({ available: true, ...fields, createdAt: now, updatedAt: now });
}

async function update(id, fields) {
  const result = await menu.updateAsync(
    { _id: id },
    { $set: { ...fields, updatedAt: new Date().toISOString() } },
    { returnUpdatedDocs: true }
  );
  return result.affectedDocuments;
}

function remove(id) {
  return menu.removeAsync({ _id: id });
}

module.exports = { ready: menu.autoloadPromise, publicItem, findById, hasCategory, findByNameInCategory, count, list, create, update, remove };
