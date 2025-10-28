const { buildProfile } = require("./builders/repository-profile");

class RepositoryCategorizer {
  constructor(rules, fallbackCategory = "Other") {
    this.rules = rules;
    this.fallbackCategory = fallbackCategory;
  }

  categorize(repositories) {
    const categories = this.initializeCategories();

    repositories.forEach((repository) => {
      const profile = buildProfile(repository);
      const matchingRule = this.rules.find((rule) => rule.predicate(profile));

      if (matchingRule) {
        categories[matchingRule.name].push(repository);
      } else {
        categories[this.fallbackCategory].push(repository);
      }
    });

    return categories;
  }

  initializeCategories() {
    return this.rules.reduce(
      (accumulator, rule) => {
        accumulator[rule.name] = [];
        return accumulator;
      },
      { [this.fallbackCategory]: [] },
    );
  }
}

module.exports = {
  RepositoryCategorizer,
};
