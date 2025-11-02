"use strict";

const path = require("path");
const {
  MARKDOWN_EXTENSIONS,
  STATIC_DIRECTORY,
  STATIC_ASSET_PREFIX,
} = require("../constants");
const { iterateFiles } = require("../utils/file-iterator");
const {
  normalizeToPosix,
  sanitizeRelativePath,
  rewriteReadmeToIndex,
  didRewriteReadme,
  toSystemPath,
  deriveTitleFromReadmePath,
} = require("../utils/path-utils");
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
    const descriptors = [];

    for (const filePath of iterateFiles(artifactPath)) {
      const relativePath = path.relative(artifactPath, filePath);
      this.core.info(`  Process file: ${relativePath}`);

      if (relativePath.startsWith("..")) {
        throw new Error(`File is outside artifact directory: ${filePath}`);
      }

      const normalizedSourcePath = normalizeToPosix(relativePath);
      const sanitizedRelativePathRaw = sanitizeRelativePath(relativePath);
      const sanitizedRelativePath = rewriteReadmeToIndex(
        sanitizedRelativePathRaw
      );
      const renamedFromReadme = didRewriteReadme(
        sanitizedRelativePathRaw,
        sanitizedRelativePath
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
        path.extname(sanitizedRelativePath).toLowerCase()
      );

      let targetRelativePath;
      let assetRegistration;

      if (isMarkdown) {
        targetRelativePath = sanitizedRelativePath;
      } else {
        assetRegistration = registerAssetPath(
          this.assetMap,
          sanitizedRelativePath
        );
        targetRelativePath = path.posix.join(
          STATIC_DIRECTORY,
          assetRegistration.storageRelativePath
        );
      }

      descriptors.push({
        sourcePath: filePath,
        normalizedSourcePath,
        sanitizedRelativePath,
        targetRelativePath,
        isMarkdown,
        assetRegistration,
        derivedTitle,
      });
    }

    if (!descriptors.length) {
      throw new Error("No files discovered in downloaded artifact.");
    }

    const processedFiles = new Set();
    const markdownWorkItems = [];

    for (const descriptor of descriptors) {
      const {
        sourcePath,
        normalizedSourcePath,
        sanitizedRelativePath,
        targetRelativePath,
        isMarkdown,
        assetRegistration,
        derivedTitle,
      } = descriptor;

      if (processedFiles.has(targetRelativePath)) {
        throw new Error(`Duplicate target detected: ${targetRelativePath}`);
      }

      const destination = toSystemPath(this.outputPath, targetRelativePath);
      await this.io.mkdirP(path.dirname(destination));
      await this.io.cp(sourcePath, destination, {
        recursive: true,
        force: true,
      });
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
          `  Copied asset: ${targetRelativePath} (public ${assetRegistration.publicPath})`
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

    return Array.from(processedFiles);
  }
}

function registerAssetPath(assetMap, assetPath) {
  const key = normalizeToPosix(assetPath);
  const storageRelativePath = path.posix.join(STATIC_ASSET_PREFIX, key);
  const publicPath = `/${storageRelativePath}`.replace(/\/+/g, "/");

  if (!assetMap.has(key)) {
    assetMap.set(key, {
      storageRelativePath,
      publicPath,
    });
  }

  const registration = assetMap.get(key);

  return {
    key,
    storageRelativePath: registration.storageRelativePath,
    publicPath: registration.publicPath,
  };
}

module.exports = {
  ArtifactProcessor,
};
