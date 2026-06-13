const { RepositoryCategorizer } = require("../repository-categorizer");

function resolveIcon(repository) {
  const categorizer = new RepositoryCategorizer();
  return categorizer.resolveCategory(repository).icon;
}

module.exports = {
  resolveIcon,
};
