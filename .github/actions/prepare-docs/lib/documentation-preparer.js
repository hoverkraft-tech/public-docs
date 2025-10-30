"use strict";

const { validateOptions } = require("./validators/options-validator");
const {
  ensureArtifactDirectory,
  prepareOutputDirectory,
} = require("./utils/fs-utils");
const { parseRepositorySlug } = require("./utils/repository-utils");
const { resolveSourceBranch } = require("./services/source-branch-resolver");
const { ArtifactProcessor } = require("./artifact/artifact-processor");
const { ensureIndexPage } = require("./artifact/index-page-writer");

class DocumentationPreparer {
  constructor(options) {
    const validated = validateOptions(options);

    this.github = validated.github;
    this.core = validated.core;
    this.io = validated.io;
    this.artifactPath = validated.artifactPath;
    this.outputPath = validated.outputPath;
    this.sourceRepository = validated.sourceRepository;
    this.runId = validated.runId;
  }

  async run() {
    ensureArtifactDirectory(this.artifactPath);

    this.core.info(
      `Preparing documentation bundle for ${this.sourceRepository}`,
    );

    await prepareOutputDirectory(this.outputPath, this.io);

    const repositoryRef = parseRepositorySlug(this.sourceRepository);
    const sourceBranch = await resolveSourceBranch({
      github: this.github,
      repositoryRef,
      runId: this.runId,
    });

    const syncTimestamp = new Date().toISOString();
    const artifactProcessor = new ArtifactProcessor({
      core: this.core,
      io: this.io,
      outputPath: this.outputPath,
      sourceRepository: this.sourceRepository,
      sourceBranch,
      runId: this.runId,
      syncTimestamp,
    });

    const processedFiles = await artifactProcessor.process(this.artifactPath);

    ensureIndexPage({
      core: this.core,
      outputPath: this.outputPath,
      processedFiles,
      repositoryRef,
      sourceRepository: this.sourceRepository,
      syncTimestamp,
    });

    this.core.info(
      `Documentation bundle prepared with ${processedFiles.length} files.`,
    );

    return {
      processedFiles,
      sourceBranch,
    };
  }
}

module.exports = {
  DocumentationPreparer,
};
