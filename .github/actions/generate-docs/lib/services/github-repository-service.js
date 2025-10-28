const { FEATURED_REPOSITORY_LIMIT } = require("../constants");

class GitHubRepositoryService {
  constructor(github) {
    this.github = github;
  }

  async fetchOrganizationRepositories(owner) {
    if (!this.github?.rest?.repos?.listForOrg) {
      throw new Error("A GitHub client is required in the Action runtime.");
    }
    const params = {
      org: owner,
      type: "public",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    };

    const repos = await this.github.paginate(
      this.github.rest.repos.listForOrg,
      params
    );
    return repos;
  }

  async fetchOrganizationPinnedRepositories(
    owner,
    limit = FEATURED_REPOSITORY_LIMIT
  ) {
    if (!this.github.graphql) {
      throw new Error(
        "GitHub client must support GraphQL to fetch pinned repositories."
      );
    }

    const pinnedQuery = `
      query($login: String!, $first: Int!) {
        organization(login: $login) {
          pinnedItems(first: $first, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.github.graphql(pinnedQuery, {
        login: owner,
        first: limit,
      });

      const nodes =
        response?.organization?.pinnedItems?.nodes?.filter(Boolean) || [];
      return nodes
        .map((node) => node.name)
        .filter((name) => typeof name === "string" && name.length > 0);
    } catch (error) {
      const reason = error?.message || error;
      throw new Error(`Failed to fetch pinned repositories: ${reason}`, {
        cause: error,
      });
    }
  }
}

module.exports = {
  GitHubRepositoryService,
};
