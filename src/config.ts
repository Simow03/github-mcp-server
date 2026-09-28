import "dotenv/config.js";
import { Octokit } from "octokit";

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
  });

  return {octokit};
}
