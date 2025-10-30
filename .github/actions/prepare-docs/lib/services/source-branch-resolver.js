"use strict";

async function resolveSourceBranch({ github, repositoryRef, runId }) {
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
      { cause: error },
    );
  }
}

module.exports = {
  resolveSourceBranch,
};
