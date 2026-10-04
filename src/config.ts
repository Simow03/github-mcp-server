import "dotenv/config.js";
import { configDotenv } from "dotenv";
import { Octokit } from "octokit";

configDotenv({ quiet: true });

const GITHUB_API_VERSION = "2026-03-10";

export type Config = { octokit: Octokit };

export function runConfig(): Config {
  const githubToken = process.env.GITHUB_PAT;

  if (!githubToken) {
    throw new Error("GITHUB_PAT is required");
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

  octokit.request = octokit.request.defaults({
    headers: {
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
  });

  return { octokit };
}
