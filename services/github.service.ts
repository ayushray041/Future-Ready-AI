// services/github.service.ts
// Responsibility: Fetches public GitHub stats (repos, commits, streak)
// for career score calculation. Data is cached in Firestore.

export const githubService = {
  async getUserStats(_username: string) {
    // Module 2: fetch from GitHub REST API
    return { repos: 0, stars: 0, commits: 0 };
  },
};
