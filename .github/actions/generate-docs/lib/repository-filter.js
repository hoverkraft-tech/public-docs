class RepositoryFilter {
  constructor({ ignoredNames }) {
    this.ignoredNames = ignoredNames;
  }

  apply(repositories) {
    return repositories.filter((repo) => {
      if (!repo?.name) {
        return false;
      }

      if (repo.name.startsWith(".")) {
        return false;
      }

      if (this.ignoredNames.has(repo.name)) {
        return false;
      }

      return true;
    });
  }
}

module.exports = {
  RepositoryFilter,
};
