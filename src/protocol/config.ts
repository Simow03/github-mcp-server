import "dotenv/config.js";
import { Octokit } from "octokit";

const githubToken = process.env.GITHUB_PAT;

if (!githubToken) {
    throw new Error("GITHUB_PAT is required");
}

const octokit = new Octokit({ auth: githubToken });

export const config = {
    octokit,
}