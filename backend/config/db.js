const fs = require('node:fs');
const path = require('node:path');
const Datastore = require('@seald-io/nedb');

function createDatastore(filename) {
  const directory = path.resolve(__dirname, '..', process.env.DATA_DIR || 'data');
  fs.mkdirSync(directory, { recursive: true });
  return new Datastore({ filename: path.join(directory, filename), autoload: true });
}

module.exports = createDatastore;
