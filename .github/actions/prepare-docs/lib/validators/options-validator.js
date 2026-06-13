"use strict";

function validateOptions(options) {
  if (!options || typeof options !== "object") {
    throw new Error("Expected options object for documentation preparation.");
  }

  const {
    github,
    core,
    io,
    artifactPath,
    outputPath,
    sourceRepository,
    runId,
    docsPath,
    staticPath,
  } = options;

  if (!github?.rest?.actions) {
    throw new Error("GitHub client is required to resolve workflow metadata.");
  }

  if (!core || typeof core.setFailed !== "function") {
    throw new Error("GitHub Actions core module is required.");
  }

  if (!io || typeof io.mkdirP !== "function") {
    throw new Error("GitHub Actions IO module is required.");
  }

  if (!artifactPath) {
    throw new Error("Artifact path is required.");
  }

  if (!outputPath) {
    throw new Error("Output path is required.");
  }

  if (!sourceRepository) {
    throw new Error("Source repository is required.");
  }

  if (!runId) {
    throw new Error("Run ID is required.");
  }

  if (!docsPath) {
    throw new Error("Docs path is required.");
  }

  if (!staticPath) {
    throw new Error("Static path is required.");
  }

  return {
    github,
    core,
    io,
    artifactPath,
    outputPath,
    sourceRepository,
    runId,
    docsPath,
    staticPath,
  };
}

module.exports = {
  validateOptions,
};
