const { ProjectsContentBuilder } = require("./projects-content-builder");
const {
  ConstDeclarationUpdater,
} = require("../builders/const-declaration-updater");

class ProjectsIndexUpdater {
  constructor({ projectsPagePath } = {}) {
    this.projectsPagePath = projectsPagePath;
    this.projectsContentBuilder = new ProjectsContentBuilder();
    this.constDeclarationUpdater = new ConstDeclarationUpdater();
  }

  async update({ categories, repositories, generatedAt }) {
    const { projectSections, statsSummary, projectSnapshot } =
      this.projectsContentBuilder.build({
        categories,
        repositories,
        generatedAt,
      });

    await this.writeProjectsPage({
      projectSections,
      statsSummary,
      projectSnapshot,
    });
  }

  async writeProjectsPage({ projectSections, statsSummary, projectSnapshot }) {
    await this.constDeclarationUpdater.update(this.projectsPagePath, [
      { name: "projectSections", value: projectSections },
      { name: "statsSummary", value: statsSummary },
      { name: "projectSnapshot", value: projectSnapshot },
    ]);
  }
}

module.exports = {
  ProjectsIndexUpdater,
};
