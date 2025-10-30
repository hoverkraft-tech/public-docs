"use strict";

const fs = require("fs");

function ensureArtifactDirectory(artifactPath) {
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact directory "${artifactPath}" not found.`);
  }
}

async function prepareOutputDirectory(outputPath, io) {
  await io.rmRF(outputPath);
  await io.mkdirP(outputPath);
}

module.exports = {
  ensureArtifactDirectory,
  prepareOutputDirectory,
};
