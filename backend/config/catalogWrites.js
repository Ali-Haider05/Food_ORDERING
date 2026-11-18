// Category deletion and menu writes share a queue because NeDB uses separate files.
let pending = Promise.resolve();

function runCatalogWrite(write) {
  const result = pending.then(write);
  pending = result.catch(() => {});
  return result;
}

module.exports = runCatalogWrite;
