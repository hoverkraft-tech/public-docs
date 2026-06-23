const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { APPLICATION_ROOT } = require("../constants");

const execFileAsync = promisify(execFile);

class ApplicationBiomeFormatter {
  constructor({ applicationRoot = APPLICATION_ROOT } = {}) {
    this.applicationRoot = applicationRoot;
  }

  async format(filePath) {
    const relativePath = path.relative(this.applicationRoot, filePath);

    await execFileAsync(
      "npm",
      [
        "--prefix",
        this.applicationRoot,
        "exec",
        "--",
        "biome",
        "format",
        "--write",
        relativePath,
      ],
      {
        cwd: this.applicationRoot,
      },
    );
  }
}

module.exports = {
  ApplicationBiomeFormatter,
};
