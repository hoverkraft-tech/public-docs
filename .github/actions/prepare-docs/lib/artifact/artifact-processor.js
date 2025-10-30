"use strict";

const path = require("path");
const { MARKDOWN_EXTENSIONS, STATIC_DIRECTORY } = require("../constants");
const { iterateFiles } = require("../utils/file-iterator");
const {
  normalizeToPosix,
  sanitizeRelativePath,
  rewriteReadmeToIndex,
  didRewriteReadme,
  toSystemPath,
  deriveTitleFromReadmePath,
} = require("../utils/path-utils");
const { registerAssetPath } = require("../utils/asset-registry");
const { MarkdownProcessor } = require("../markdown/markdown-processor");

class ArtifactProcessor {
  constructor({
    core,
    io,
    outputPath,
    sourceRepository,
    sourceBranch,
    runId,
    docsPath,
    staticPath,
    syncTimestamp,
  }) {
    this.core = core;
    this.io = io;
    this.outputPath = outputPath;
    this.sourceRepository = sourceRepository;
    this.sourceBranch = sourceBranch;
    this.runId = runId;
    this.docsPath = docsPath;
    this.staticPath = staticPath;
    this.syncTimestamp = syncTimestamp;
    this.assetMap = new Map();
    this.markdownProcessor = new MarkdownProcessor({
      sourceRepository,
      sourceBranch,
      runId,
      syncTimestamp,
      assetMap: this.assetMap,
      docsPath: this.docsPath,
      staticPath: this.staticPath,
    });
  }

  async process(artifactPath) {
    const processedFiles = new Set();
    const markdownWorkItems = [];

    for (const filePath of iterateFiles(artifactPath)) {
      const relativePath = path.relative(artifactPath, filePath);
      this.core.info(`  Process file: ${relativePath}`);

      if (relativePath.startsWith("..")) {
        throw new Error(`File is outside artifact directory: ${filePath}`);
      }

      const normalizedSourcePath = normalizeToPosix(relativePath);
      const sanitizedRelativePathRaw = sanitizeRelativePath(relativePath);
      const sanitizedRelativePath = rewriteReadmeToIndex(
        sanitizedRelativePathRaw,
      );
      const renamedFromReadme = didRewriteReadme(
        sanitizedRelativePathRaw,
        sanitizedRelativePath,
      );
      const derivedTitle = renamedFromReadme
        ? deriveTitleFromReadmePath({
            indexPath: sanitizedRelativePath,
            sourceRepository: this.sourceRepository,
          })
        : undefined;

      if (!sanitizedRelativePath) {
        throw new Error(`File has empty sanitized path: ${filePath}`);
      }

      const isMarkdown = MARKDOWN_EXTENSIONS.has(
        path.extname(sanitizedRelativePath).toLowerCase(),
      );

      let targetRelativePath;
      let destination;
      let assetRegistration;

      if (isMarkdown) {
        targetRelativePath = sanitizedRelativePath;
        destination = toSystemPath(this.outputPath, targetRelativePath);
      } else {
        assetRegistration = registerAssetPath(
          this.assetMap,
          sanitizedRelativePath,
        );
        targetRelativePath = path.posix.join(
          STATIC_DIRECTORY,
          assetRegistration.storageRelativePath,
        );
        destination = toSystemPath(this.outputPath, targetRelativePath);
      }

      if (processedFiles.has(targetRelativePath)) {
        throw new Error(`Duplicate target detected: ${targetRelativePath}`);
      }

      await this.io.mkdirP(path.dirname(destination));
      await this.io.cp(filePath, destination, { recursive: true, force: true });
      processedFiles.add(targetRelativePath);

      if (isMarkdown) {
        markdownWorkItems.push({
          destination,
          normalizedSourcePath,
          docRelativePath: sanitizedRelativePath,
          title: derivedTitle,
        });
      } else {
        this.core.info(
          `  Copied asset: ${targetRelativePath} (public ${assetRegistration.publicPath})`,
        );
      }
    }

    for (const item of markdownWorkItems) {
      this.markdownProcessor.process({
        filePath: item.destination,
        sourcePath: item.normalizedSourcePath,
        docRelativePath: item.docRelativePath,
        title: item.title,
      });
      this.core.info(`  Prepared markdown: ${item.docRelativePath}`);
    }

    if (!processedFiles.size) {
      throw new Error("No files discovered in downloaded artifact.");
    }

    return Array.from(processedFiles);
  }
}

module.exports = {
  ArtifactProcessor,
};
