import "dotenv/config.js";
import { Octokit } from "octokit";

export type Config = { octokit: Octokit };

export function runConfig(): Config {
  const githubToken = process.env.GITHUB_PAT;

  if (!githubToken) {
    throw "GITHUB_PAT is required";
  }

  const octokit = new Octokit({
    auth: githubToken,
    throttle: {
      onRateLimit: () => false,
      onSecondaryRateLimit: () => false,
    },
    retry: {
      doNotRetry: [400, 401, 403, 404, 410, 422, 429, 451],
    },
  });

  return { octokit };
}
