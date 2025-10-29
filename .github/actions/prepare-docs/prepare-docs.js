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
  const { github, core, io, sourceRepo, runId, artifactPath, outputPath } =
    validateOptions(options);

  try {
    ensureArtifactDirectory(artifactPath);

    core.info(`Preparing documentation bundle for ${sourceRepo}`);

    prepareOutputDirectory(outputPath, io);

    const repositoryRef = parseRepositorySlug(sourceRepo);
    const sourceBranch = await resolveSourceBranch({
      github,
      core,
      repositoryRef,
      runId,
    });

    const syncTimestamp = new Date().toISOString();
    const processedFiles = processArtifact({
      core,
      io,
      artifactPath,
      outputPath,
      sourceRepo,
      sourceBranch,
      runId,
      syncTimestamp,
    });

    ensureIndexPage({
      core,
      outputPath,
      processingResult,
      repositoryRef,
      sourceRepo,
      syncTimestamp,
    });

    core.info(
      `Documentation bundle prepared with ${processedFiles.length} files.`
    );

    return {
      processedFiles,
      sourceBranch,
    };
  } catch (error) {
    return core.setFailed(
      error?.message || "Failed to prepare documentation bundle."
    );
  }
}

function validateOptions(options) {
  if (!options || typeof options !== "object") {
    throw new Error("Expected options object for documentation preparation.");
  }

  const { github, core, io, artifactPath, outputPath, sourceRepo, runId } =
    options;

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

  if (!sourceRepo) {
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
    sourceRepo,
    runId,
  };
}

function ensureArtifactDirectory(artifactPath) {
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact directory "${artifactPath}" not found.`);
  }
}

function prepareOutputDirectory(outputPath, io) {
  io.rmRF(outputPath);
  io.mkdirP(outputPath);
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

function processArtifact({
  artifactPath,
  outputPath,
  core,
  io,
  sourceRepo,
  sourceBranch,
  runId,
  syncTimestamp,
}) {
  const copiedTargets = new Set();
  const markdownFiles = [];

  for (const filePath of iterateFiles(artifactPath)) {
    const relativePath = path.relative(artifactPath, filePath);

    if (relativePath.startsWith("..")) {
      throw new Error(`Skipping file outside artifact directory: ${filePath}`);
    }

    const normalizedSourcePath = normalizeToPosix(relativePath);
    const sanitizedRelativePath = sanitizeRelativePath(relativePath);

    if (!sanitizedRelativePath) {
      throw new Error(`Skipping file with empty sanitized path: ${filePath}`);
    }

    if (copiedTargets.has(sanitizedRelativePath)) {
      throw new Error(
        `Duplicate target detected, skipping ${sanitizedRelativePath}`
      );
    }

    const destination = path.join(outputPath, sanitizedRelativePath);

    io.mkdirP(path.dirname(destination));
    io.cp(filePath, destination, { recursive: true, force: true });

    if (isMarkdownFile(destination)) {
      applyFrontmatter(destination, {
        sourceRepo,
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

    copiedTargets.add(sanitizedRelativePath);
  }

  if (!markdownFiles.length) {
    throw new Error("No markdown files discovered in downloaded artifact.");
  }

  return { copiedTargets, markdownFiles };
}

function ensureIndexPage({
  core,
  outputPath,
  processingResult,
  repositoryRef,
  sourceRepo,
  syncTimestamp,
}) {
  if (processingResult.copiedTargets.has(DEFAULT_INDEX_FILE)) {
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
    `**Source Repository:** [${sourceRepo}](https://github.com/${sourceRepo})`,
    `**Last Synced:** ${syncTimestamp}`,
  ];

  fs.writeFileSync(
    path.join(outputPath, DEFAULT_INDEX_FILE),
    indexLines.join("\n")
  );
  processingResult.copiedTargets.add(DEFAULT_INDEX_FILE);
  processingResult.markdownFiles.push(DEFAULT_INDEX_FILE);
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

function sanitizeSegment(segment = "") {
  return segment
    .replace(/^[.\s]+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function applyFrontmatter(
  filePath,
  { sourceRepo, sourcePath, sourceBranch, runId, syncTimestamp }
) {
  const content = fs.readFileSync(filePath, "utf8");
  const metadata = [
    `source_repo: ${sourceRepo}`,
    `source_path: ${sourcePath}`,
    `source_branch: ${sourceBranch}`,
    `source_run_id: ${runId}`,
    `last_synced: ${syncTimestamp}`,
  ].join("\n");
  const frontmatterBlock = `${FRONTMATTER_HEADER}${metadata}${FRONTMATTER_FOOTER}`;

  if (!content.startsWith(FRONTMATTER_HEADER)) {
    fs.writeFileSync(filePath, `${frontmatterBlock}\n${content}`);
    return;
  }

  const endIndex = content.indexOf(
    FRONTMATTER_FOOTER,
    FRONTMATTER_HEADER.length
  );
  if (endIndex === -1) {
    fs.writeFileSync(filePath, `${frontmatterBlock}\n${content}`);
    return;
  }

  const existing = content.substring(FRONTMATTER_HEADER.length, endIndex);
  const body = content.substring(endIndex + FRONTMATTER_FOOTER.length);
  const mergedFrontmatter = [existing, metadata].filter(Boolean).join("\n");
  fs.writeFileSync(
    filePath,
    `${FRONTMATTER_HEADER}${mergedFrontmatter}${FRONTMATTER_FOOTER}${body}`
  );
}

module.exports = { run };
