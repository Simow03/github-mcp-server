import { mergedPull, openPull } from "./pullRequest.js";

export const repositoryFixture = {
  description: null,
  default_branch: "main",
  visibility: "public",
  private: false,
  archived: false,
  html_url: "https://github.com/o/r",
  fork: false,
  pushed_at: "2026-09-01T00:00:00Z",
};

export const pullRequestsFixture = [openPull, mergedPull];