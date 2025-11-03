"use strict";

const fs = require("fs");
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
  formatTitleFromSlug,
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
    this.docsRootSegment = deriveRootSegment(docsPath);
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
    const nestedDirectories = new Set();

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
      let assetRegistration;

      if (isMarkdown) {
        targetRelativePath = sanitizedRelativePath;
      } else {
        assetRegistration = registerAssetPath(
          this.assetMap,
          sanitizedRelativePath,
        );
        targetRelativePath = path.posix.join(
          STATIC_DIRECTORY,
          assetRegistration.storageRelativePath,
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

        const directoryPath = path.posix.dirname(sanitizedRelativePath);
        if (directoryPath && directoryPath !== ".") {
          const hierarchy = collectDirectoryHierarchy(directoryPath);
          for (const nestedDirectory of hierarchy) {
            if (
              this.docsRootSegment &&
              nestedDirectory.toLowerCase() === this.docsRootSegment
            ) {
              continue;
            }
            nestedDirectories.add(nestedDirectory);
          }
        }
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

    await this.ensureDirectoryIndexes({
      directories: nestedDirectories,
      processedFiles,
    });

    return Array.from(processedFiles);
  }

  async ensureDirectoryIndexes({ directories, processedFiles }) {
    if (!directories.size) {
      return;
    }

    for (const directory of directories) {
      const indexPath = path.posix.join(directory, "index.md");
      const underscoreIndexPath = path.posix.join(directory, "_index.md");

      if (
        processedFiles.has(indexPath) ||
        processedFiles.has(underscoreIndexPath)
      ) {
        continue;
      }

      const label = formatTitleFromSlug(directory.split("/").pop());
      if (!label) {
        continue;
      }

      const destination = toSystemPath(this.outputPath, underscoreIndexPath);
      await this.io.mkdirP(path.dirname(destination));

      const contentLines = [
        "---",
        `title: ${label}`,
        `description: Overview for ${label}`,
        `sidebar_label: ${label}`,
        "---",
        "",
        `# ${label}`,
        "",
        `This page is generated automatically to introduce the ${label} documentation section.`,
        "",
      ];

      fs.writeFileSync(destination, `${contentLines.join("\n")}\n`);
      processedFiles.add(underscoreIndexPath);
      this.core.info(`  Generated nested index: ${underscoreIndexPath}`);
    }
  }
}

function deriveRootSegment(docsPath) {
  if (!docsPath) {
    return "";
  }

  const normalized = path.normalize(docsPath);
  const base = path.basename(normalized);
  return base ? base.toLowerCase() : "";
}

function collectDirectoryHierarchy(directory) {
  if (!directory) {
    return [];
  }

  const segments = directory.split("/").filter(Boolean);
  const hierarchy = [];

  for (let depth = 0; depth < segments.length; depth += 1) {
    const candidate = segments.slice(0, depth + 1).join("/");
    if (candidate) {
      hierarchy.push(candidate);
    }
  }

  return hierarchy;
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
