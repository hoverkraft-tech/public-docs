"use strict";

const fs = require("fs");
const path = require("path");
const { DEFAULT_INDEX_FILE } = require("../constants");
const { formatTitleFromSlug } = require("../utils/path-utils");

function ensureIndexPage({
  core,
  outputPath,
  processedFiles,
  repositoryRef,
  sourceRepository,
  syncTimestamp,
}) {
  if (processedFiles.includes(DEFAULT_INDEX_FILE)) {
    return;
  }

  const prettyRepoName = formatTitleFromSlug(repositoryRef.name);
  const indexLines = [
    "---",
    `title: ${prettyRepoName}`,
    `description: Documentation for ${prettyRepoName}`,
    "---",
    "",
    `# ${prettyRepoName}`,
    "",
    `Documentation for the ${prettyRepoName} project.`,
    "",
    `**Source Repository:** [${sourceRepository}](https://github.com/${sourceRepository})`,
    `**Last Synced:** ${syncTimestamp}`,
  ];

  fs.writeFileSync(
    path.join(outputPath, DEFAULT_INDEX_FILE),
    indexLines.join("\n"),
  );
  processedFiles.push(DEFAULT_INDEX_FILE);
  core.info("Generated default index page for documentation bundle.");
}

module.exports = {
  ensureIndexPage,
};
