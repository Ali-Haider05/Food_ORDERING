const createDatastore = require('../config/db');

const users = createDatastore('users.db');
const ready = (async () => {
  await users.autoloadPromise;
  await users.ensureIndexAsync({ fieldName: 'email', unique: true });
})();

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function createUser({ name, email, password }) {
  return users.insertAsync({
    name: name.trim(),
    email: normalizeEmail(email),
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  });
}

function findByEmail(email) {
  return users.findOneAsync({ email: normalizeEmail(email) });
}

function findById(id) {
  return users.findOneAsync({ _id: id });
}

module.exports = { ready, normalizeEmail, publicUser, createUser, findByEmail, findById };
