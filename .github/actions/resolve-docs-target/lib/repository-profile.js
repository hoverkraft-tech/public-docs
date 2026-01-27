function buildProfile(repository) {
  return {
    name: (repository.name || "").toLowerCase(),
    description: (repository.description || "").toLowerCase(),
    topics: new Set(repository.topics || []),
  };
}

module.exports = {
  buildProfile,
};
