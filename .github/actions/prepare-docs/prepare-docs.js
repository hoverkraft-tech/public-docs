#!/usr/bin/env node

"use strict";

const { DocumentationPreparer } = require("./lib/documentation-preparer");

async function run(options = {}) {
  const preparer = new DocumentationPreparer(options);
  return await preparer.run();
}

module.exports = { run };
