"use strict";

const fs = require("fs");
const { FRONTMATTER_HEADER, FRONTMATTER_FOOTER } = require("../constants");
const { normalizeMarkdownBody } = require("./markdown-normalizer");

class MarkdownProcessor {
  constructor({
    sourceRepository,
    sourceBranch,
    runId,
    syncTimestamp,
    assetMap,
    docsPath,
    staticPath,
  }) {
    this.sourceRepository = sourceRepository;
    this.sourceBranch = sourceBranch;
    this.runId = runId;
    this.syncTimestamp = syncTimestamp;
    this.assetMap = assetMap;
    this.docsPath = docsPath;
    this.staticPath = staticPath;
  }

  process({ filePath, sourcePath, docRelativePath, title }) {
    const content = fs.readFileSync(filePath, "utf8");
    const { hasFrontmatter, existingFrontmatter, body } =
      extractFrontmatter(content);

    const metadataLines = buildMetadataLines({
      sourceRepository: this.sourceRepository,
      sourceBranch: this.sourceBranch,
      runId: this.runId,
      syncTimestamp: this.syncTimestamp,
      sourcePath,
      title,
      existingFrontmatter,
    });

    const metadata = metadataLines.join("\n");
    const normalizedBody = normalizeMarkdownBody(body, {
      assetMap: this.assetMap,
      docRelativePath,
      docsPath: this.docsPath,
      staticPath: this.staticPath,
    });

    if (!hasFrontmatter) {
      const frontmatterBlock = `${FRONTMATTER_HEADER}${metadata}${FRONTMATTER_FOOTER}`;
      fs.writeFileSync(filePath, `${frontmatterBlock}\n${normalizedBody}`);
      return;
    }

    const mergedFrontmatter = [existingFrontmatter, metadata]
      .filter(Boolean)
      .join("\n");

    fs.writeFileSync(
      filePath,
      `${FRONTMATTER_HEADER}${mergedFrontmatter}${FRONTMATTER_FOOTER}${normalizedBody}`
    );
  }
}

function buildMetadataLines({
  sourceRepository,
  sourceBranch,
  runId,
  syncTimestamp,
  sourcePath,
  title,
  existingFrontmatter,
}) {
  const lines = [];
  const hasTitleField = hasFrontmatterField(existingFrontmatter, "title");
  if (title && !hasTitleField) {
    lines.push(`title: ${title}`);
  }

  lines.push(
    `source_repo: ${sourceRepository}`,
    `source_path: ${sourcePath}`,
    `source_branch: ${sourceBranch}`,
    `source_run_id: ${runId}`,
    `last_synced: ${syncTimestamp}`
  );

  return lines;
}

function extractFrontmatter(content) {
  if (!content.startsWith(FRONTMATTER_HEADER)) {
    return {
      hasFrontmatter: false,
      existingFrontmatter: "",
      body: content,
    };
  }

  const endIndex = content.indexOf(
    FRONTMATTER_FOOTER,
    FRONTMATTER_HEADER.length
  );

  if (endIndex === -1) {
    return {
      hasFrontmatter: false,
      existingFrontmatter: "",
      body: content,
    };
  }

  return {
    hasFrontmatter: true,
    existingFrontmatter: content.substring(FRONTMATTER_HEADER.length, endIndex),
    body: content.substring(endIndex + FRONTMATTER_FOOTER.length),
  };
}

function hasFrontmatterField(frontmatter, fieldName) {
  if (!frontmatter) {
    return false;
  }

  const pattern = new RegExp(`(^|\n)\s*${escapeRegExp(fieldName)}\s*:`, "i");
  return pattern.test(frontmatter);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  MarkdownProcessor,
};
