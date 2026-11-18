const createDatastore = require('../config/db');

const categories = createDatastore('categories.db');
const ready = (async () => {
  await categories.autoloadPromise;
  await categories.ensureIndexAsync({ fieldName: 'normalizedName', unique: true });
})();

function publicCategory(category) {
  return { id: category._id, name: category.name, createdAt: category.createdAt };
}

function nameFields(name) {
  const trimmed = name.trim();
  return { name: trimmed, normalizedName: trimmed.toLowerCase() };
}

function list() {
  return categories.findAsync({}).sort({ normalizedName: 1 }).execAsync();
}

function findById(id) {
  return categories.findOneAsync({ _id: id });
}

function findByName(name) {
  return categories.findOneAsync({ normalizedName: nameFields(name).normalizedName });
}

function create(name) {
  return categories.insertAsync({ ...nameFields(name), createdAt: new Date().toISOString() });
}

async function update(id, name) {
  const result = await categories.updateAsync(
    { _id: id }, { $set: nameFields(name) }, { returnUpdatedDocs: true }
  );
  return result.affectedDocuments;
}

function remove(id) {
  return categories.removeAsync({ _id: id });
}

module.exports = { ready, publicCategory, list, findById, findByName, create, update, remove };
