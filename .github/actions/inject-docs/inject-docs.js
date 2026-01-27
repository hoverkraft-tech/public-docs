#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

async function run({ core, io, env }) {
  const sourceRepository = env.SOURCE_REPOSITORY;
  const docsPath = env.DOCS_PATH;
  const staticPath = env.STATIC_PATH;
  const preparedDir = env.PREPARED_DIR;

  if (!sourceRepository) {
    core.setFailed("Missing source repository from prepare-docs step.");
    return;
  }

  if (!docsPath) {
    core.setFailed("Missing docs path from prepare-docs step.");
    return;
  }

  if (!staticPath) {
    core.setFailed("Missing static path from prepare-docs step.");
    return;
  }

  if (!preparedDir) {
    core.setFailed("Missing prepared directory configuration.");
    return;
  }

  core.info(`Starting documentation injection from ${sourceRepository}`);

  if (!fs.existsSync(preparedDir)) {
    core.setFailed("Prepared documentation directory not found.");
    return;
  }

  await io.rmRF(docsPath);
  await io.mkdirP(path.dirname(docsPath));
  await io.cp(preparedDir, docsPath, { recursive: true });

  const staticAssetsSrc = path.join(docsPath, "static");
  if (fs.existsSync(staticAssetsSrc)) {
    await io.rmRF(staticPath);
    await io.mkdirP(path.dirname(staticPath));
    await io.mv(staticAssetsSrc, staticPath);
  }

  core.info(`Documentation injected into ${docsPath}`);
}

module.exports = { run };
