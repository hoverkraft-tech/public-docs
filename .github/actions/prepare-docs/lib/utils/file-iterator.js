"use strict";

const fs = require("fs");
const path = require("path");

function* iterateFiles(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      yield* iterateFiles(entryPath);
    } else if (entry.isFile()) {
      yield entryPath;
    }
  }
}

module.exports = {
  iterateFiles,
};
