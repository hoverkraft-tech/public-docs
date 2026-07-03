const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { APPLICATION_ROOT } = require("../constants");

const execFileAsync = promisify(execFile);

class ApplicationBiomeFormatter {
  constructor({
    applicationRoot = APPLICATION_ROOT,
    exec = execFileAsync,
  } = {}) {
    this.applicationRoot = applicationRoot;
    this.exec = exec;
  }

  async format(filePath) {
    const relativePath = path.relative(this.applicationRoot, filePath);

    await this.exec(
      "npm",
      [
        "--prefix",
        this.applicationRoot,
        "exec",
        "--",
        "biome",
        "check",
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
