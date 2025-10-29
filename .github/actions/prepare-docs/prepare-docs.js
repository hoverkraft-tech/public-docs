"use strict";

const fs = require("fs");
const path = require("path");

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const DEFAULT_INDEX_FILE = "_index.md";
const FRONTMATTER_HEADER = "---\n";
const FRONTMATTER_FOOTER = "\n---\n";

/**
 * Prepare documentation bundle from downloaded artifact.
 * @param {object} options
 * @param {import('@octokit/rest').Octokit} options.github
 * @param {import('@actions/core')} options.core
 * @param {import('@actions/github').context} options.context
 * @param {string} options.artifactPath
 * @param {string} options.outputPath
 */
async function run(options) {
  const {
    github,
    core,
    io,
    sourceRepository,
    runId,
    artifactPath,
    outputPath,
  } = validateOptions(options);

  ensureArtifactDirectory(artifactPath);

  core.info(`Preparing documentation bundle for ${sourceRepository}`);

  await prepareOutputDirectory(outputPath, io);

  const repositoryRef = parseRepositorySlug(sourceRepository);
  const sourceBranch = await resolveSourceBranch({
    github,
    core,
    repositoryRef,
    runId,
  });

  const syncTimestamp = new Date().toISOString();
  const processedFiles = await processArtifact({
    core,
    io,
    artifactPath,
    outputPath,
    sourceRepository,
    sourceBranch,
    runId,
    syncTimestamp,
  });

  ensureIndexPage({
    core,
    outputPath,
    processedFiles,
    repositoryRef,
    sourceRepository,
    syncTimestamp,
  });

  core.info(
    `Documentation bundle prepared with ${processedFiles.length} files.`
  );

  return {
    processedFiles,
    sourceBranch,
  };
}

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

  return {
    github,
    core,
    io,
    artifactPath,
    outputPath,
    sourceRepository,
    runId,
  };
}

function ensureArtifactDirectory(artifactPath) {
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact directory "${artifactPath}" not found.`);
  }
}

async function prepareOutputDirectory(outputPath, io) {
  await io.rmRF(outputPath);
  await io.mkdirP(outputPath);
}

function parseRepositorySlug(repository) {
  const [owner, name] = (repository || "").split("/");
  if (!owner || !name) {
    throw new Error(`Invalid repository slug "${repository}".`);
  }

  return { owner, name };
}

async function resolveSourceBranch({ github, core, repositoryRef, runId }) {
  try {
    const run = await github.rest.actions.getWorkflowRun({
      owner: repositoryRef.owner,
      repo: repositoryRef.name,
      run_id: runId,
    });

    if (run.data?.head_branch) {
      return run.data.head_branch;
    }

    throw new Error("Source branch information is missing in workflow run.");
  } catch (error) {
    throw new Error(
      `Failed to resolve source branch for ${repositoryRef.owner}/${repositoryRef.name} run ${runId}: ${error.message}`,
      { cause: error }
    );
  }
}

async function processArtifact({
  artifactPath,
  outputPath,
  core,
  io,
  sourceRepository,
  sourceBranch,
  runId,
  syncTimestamp,
}) {
  const processedFiles = new Set();
  const markdownFiles = [];

  for (const filePath of iterateFiles(artifactPath)) {
    const relativePath = path.relative(artifactPath, filePath);

    core.info(`  Process file: ${relativePath}`);

    if (relativePath.startsWith("..")) {
      throw new Error(`File is outside artifact directory: ${filePath}`);
    }

    const normalizedSourcePath = normalizeToPosix(relativePath);
    const sanitizedRelativePath = rewriteReadmeToIndex(
      sanitizeRelativePath(relativePath)
    );

    if (!sanitizedRelativePath) {
      throw new Error(`File has empty sanitized path: ${filePath}`);
    }

    if (processedFiles.has(sanitizedRelativePath)) {
      throw new Error(`Duplicate target detected: ${sanitizedRelativePath}`);
    }

    const destination = path.join(outputPath, sanitizedRelativePath);

    await io.mkdirP(path.dirname(destination));
    await io.cp(filePath, destination, { recursive: true, force: true });

    if (isMarkdownFile(destination)) {
      applyFrontmatter(destination, {
        sourceRepository,
        sourcePath: normalizedSourcePath,
        sourceBranch,
        runId,
        syncTimestamp,
      });
      markdownFiles.push(sanitizedRelativePath);
      core.info(`  Prepared markdown: ${sanitizedRelativePath}`);
    } else {
      core.info(`  Copied asset: ${sanitizedRelativePath}`);
    }

    processedFiles.add(sanitizedRelativePath);
  }

  if (!processedFiles.size) {
    throw new Error("No files discovered in downloaded artifact.");
  }

  return Array.from(processedFiles);
}

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

  const prettyRepoName = repositoryRef.name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

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
    indexLines.join("\n")
  );
  processedFiles.push(DEFAULT_INDEX_FILE);
  core.info("Generated default index page for documentation bundle.");
}

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

function isMarkdownFile(filePath) {
  return MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function normalizeToPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function sanitizeRelativePath(relPath) {
  return normalizeToPosix(relPath)
    .split("/")
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean)
    .join("/");
}

function rewriteReadmeToIndex(relPath) {
  if (!relPath) {
    return relPath;
  }

  const segments = relPath.split("/");
  const lastIndex = segments.length - 1;

  if (lastIndex >= 0 && segments[lastIndex].toLowerCase() === "readme.md") {
    segments[lastIndex] = "index.md";
  }

  return segments.join("/");
}

function sanitizeSegment(segment = "") {
  return segment
    .replace(/^[.\s]+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function applyFrontmatter(
  filePath,
  { sourceRepository, sourcePath, sourceBranch, runId, syncTimestamp }
) {
  const content = fs.readFileSync(filePath, "utf8");
  const metadata = [
    `source_repo: ${sourceRepository}`,
    `source_path: ${sourcePath}`,
    `source_branch: ${sourceBranch}`,
    `source_run_id: ${runId}`,
    `last_synced: ${syncTimestamp}`,
  ].join("\n");
  const frontmatterBlock = `${FRONTMATTER_HEADER}${metadata}${FRONTMATTER_FOOTER}`;

  if (!content.startsWith(FRONTMATTER_HEADER)) {
    const normalizedContent = normalizeMarkdownBody(content);
    fs.writeFileSync(filePath, `${frontmatterBlock}\n${normalizedContent}`);
    return;
  }

  const endIndex = content.indexOf(
    FRONTMATTER_FOOTER,
    FRONTMATTER_HEADER.length
  );
  if (endIndex === -1) {
    const normalizedContent = normalizeMarkdownBody(content);
    fs.writeFileSync(filePath, `${frontmatterBlock}\n${normalizedContent}`);
    return;
  }

  const existing = content.substring(FRONTMATTER_HEADER.length, endIndex);
  const body = content.substring(endIndex + FRONTMATTER_FOOTER.length);
  const mergedFrontmatter = [existing, metadata].filter(Boolean).join("\n");
  fs.writeFileSync(
    filePath,
    `${FRONTMATTER_HEADER}${mergedFrontmatter}${FRONTMATTER_FOOTER}${normalizeMarkdownBody(
      body
    )}`
  );
}

function convertAngleBracketLinks(text) {
  if (!text) {
    return text;
  }

  return text.replace(
    /<(https?:\/\/[^>\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})>/g,
    (match, raw) => {
      const isEmail = raw.includes("@");
      const href = isEmail ? `mailto:${raw}` : raw;
      return `[${raw}](${href})`;
    }
  );
}

function normalizeMarkdownBody(content) {
  if (!content) {
    return content;
  }

  return rewriteLocalLinks(convertAngleBracketLinks(content));
}

function rewriteLocalLinks(text) {
  if (!text) {
    return text;
  }

  let result = "";
  let index = 0;

  while (index < text.length) {
    const bracketIndex = text.indexOf("[", index);
    if (bracketIndex === -1) {
      result += text.slice(index);
      break;
    }

    result += text.slice(index, bracketIndex);

    let cursor = bracketIndex + 1;
    let nested = 0;
    let bracketEnd = -1;

    while (cursor < text.length) {
      const char = text[cursor];
      if (char === "\\") {
        cursor += 2;
        continue;
      }
      if (char === "[") {
        nested += 1;
      } else if (char === "]") {
        if (nested === 0) {
          bracketEnd = cursor;
          break;
        }
        nested -= 1;
      }
      cursor += 1;
    }

    if (bracketEnd === -1) {
      result += text.slice(bracketIndex);
      break;
    }

    const afterBracket = bracketEnd + 1;

    if (text[afterBracket] !== "(") {
      result += text.slice(bracketIndex, afterBracket);
      index = afterBracket;
      continue;
    }

    let parenCursor = afterBracket + 1;
    let parenDepth = 0;
    let parenEnd = -1;

    while (parenCursor < text.length) {
      const char = text[parenCursor];
      if (char === "\\") {
        parenCursor += 2;
        continue;
      }
      if (char === "(") {
        parenDepth += 1;
      } else if (char === ")") {
        if (parenDepth === 0) {
          parenEnd = parenCursor;
          break;
        }
        parenDepth -= 1;
      }
      parenCursor += 1;
    }

    if (parenEnd === -1) {
      result += text.slice(bracketIndex);
      break;
    }

    const target = text.slice(afterBracket + 1, parenEnd);
    const rewrittenTarget = rewriteLinkTarget(target);

    result += text.slice(bracketIndex, afterBracket + 1);
    result += rewrittenTarget;
    result += ")";

    index = parenEnd + 1;
  }

  return rewriteReferenceLinks(result);
}

function rewriteReferenceLinks(text) {
  const referencePattern = /^(\s*\[[^\]]+\]:\s*)(.+)$/gm;

  return text.replace(referencePattern, (match, prefix, target) => {
    const rewritten = rewriteLinkTarget(target);
    if (rewritten === target) {
      return match;
    }
    return `${prefix}${rewritten}`;
  });
}

function rewriteLinkTarget(rawTarget) {
  if (!rawTarget) {
    return rawTarget;
  }

  const leadingWhitespaceMatch = rawTarget.match(/^\s+/);
  const leadingWhitespace = leadingWhitespaceMatch
    ? leadingWhitespaceMatch[0]
    : "";
  const trimmedValue = rawTarget.trim();

  if (!trimmedValue) {
    return rawTarget;
  }

  let urlPart = trimmedValue;
  let trailingTitle = "";

  const quoteTitleMatch = trimmedValue.match(/\s+(".*"|'.*')\s*$/);
  if (quoteTitleMatch) {
    trailingTitle = quoteTitleMatch[0];
    urlPart = trimmedValue
      .slice(0, trimmedValue.length - trailingTitle.length)
      .trim();
  } else {
    const parenTitleMatch = trimmedValue.match(/\s+\([^)]*\)\s*$/);
    if (parenTitleMatch) {
      trailingTitle = parenTitleMatch[0];
      urlPart = trimmedValue
        .slice(0, trimmedValue.length - trailingTitle.length)
        .trim();
    }
  }

  if (!urlPart || isExternalLink(urlPart)) {
    return rawTarget;
  }

  const { path: targetPath, suffix } = splitLinkPathAndSuffix(urlPart);
  if (!targetPath) {
    return rawTarget;
  }

  const sanitizedPath = sanitizeLinkPath(targetPath);
  const rebuiltTarget = `${sanitizedPath}${suffix}`;

  if (rebuiltTarget === urlPart) {
    return rawTarget;
  }

  return `${leadingWhitespace}${rebuiltTarget}${trailingTitle}`;
}

function isExternalLink(target) {
  const trimmed = target.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("#")) {
    return true;
  }

  if (trimmed.startsWith("//")) {
    return true;
  }

  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
}

function sanitizeLinkPath(targetPath) {
  if (!targetPath) {
    return targetPath;
  }

  const normalized = normalizeToPosix(targetPath);
  const hasLeadingSlash = normalized.startsWith("/");
  const hasTrailingSlash = normalized.length > 1 && normalized.endsWith("/");

  const segments = normalized.split("/");
  const sanitizedSegments = [];

  segments.forEach((segment, index) => {
    if (segment === "" && index === 0 && hasLeadingSlash) {
      sanitizedSegments.push("");
      return;
    }

    if (segment === "" && index === segments.length - 1 && hasTrailingSlash) {
      sanitizedSegments.push("");
      return;
    }

    if (segment === "." || segment === "..") {
      sanitizedSegments.push(segment);
      return;
    }

    if (!segment) {
      return;
    }

    const sanitized = sanitizeSegment(segment);
    if (sanitized) {
      sanitizedSegments.push(sanitized);
    }
  });

  let sanitizedPath = sanitizedSegments.join("/");

  if (hasLeadingSlash && !sanitizedPath.startsWith("/")) {
    sanitizedPath = `/${sanitizedPath}`;
  }

  if (hasTrailingSlash && !sanitizedPath.endsWith("/")) {
    sanitizedPath = `${sanitizedPath}/`;
  }

  const rewrittenPath = rewriteReadmeToIndex(sanitizedPath);
  return rewrittenPath;
}

function splitLinkPathAndSuffix(target) {
  let cutIndex = -1;
  const hashIndex = target.indexOf("#");
  const queryIndex = target.indexOf("?");

  if (hashIndex !== -1 && queryIndex !== -1) {
    cutIndex = Math.min(hashIndex, queryIndex);
  } else if (hashIndex !== -1) {
    cutIndex = hashIndex;
  } else if (queryIndex !== -1) {
    cutIndex = queryIndex;
  }

  if (cutIndex === -1) {
    return { path: target, suffix: "" };
  }

  return {
    path: target.slice(0, cutIndex),
    suffix: target.slice(cutIndex),
  };
}

module.exports = { run };
