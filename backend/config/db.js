const fs = require('node:fs');
const path = require('node:path');
const Datastore = require('@seald-io/nedb');

const dataDirectory = path.resolve(__dirname, '..', process.env.DATA_DIR || 'data');
fs.mkdirSync(dataDirectory, { recursive: true });

const datastore = new Datastore({
  filename: path.join(dataDirectory, 'test.db'),
  autoload: true,
});

module.exports = datastore;
