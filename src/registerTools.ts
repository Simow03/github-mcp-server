import { McpServer } from "@modelcontextprotocol/server";
import {
  getRepositoryInputSchema,
  GetRepositoryOutput,
  getRepositoryOutputSchema,
} from "./schemas/getRepository.schema";
import { Octokit } from "octokit";

const GITHUB_PAT = process.env.GITHUB_PAT;

const octokit = new Octokit({ auth: GITHUB_PAT });

async function registerTools(server: McpServer) {

  server.registerTool(
    "get-repository",
    {
      title: "get repository",
      description: "get metadata about a github repository, including its description, default branch, visibility, archive status, fork status, url, and last push timestamp.",
      inputSchema: getRepositoryInputSchema,
      outputSchema: getRepositoryOutputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async ({ owner, repo }) => {
      const response = await octokit.request(`GET /repos/${owner}/${repo}`, {
        owner,
        repo,
        headers: {
          "X-GitHub-Api-Version": "2026-03-10",
        },
      });

      const output: GetRepositoryOutput = {
        description: response.data.description,
        default_branch: response.data.default_branch,
        visibility: response.data.visibility,
        archived: response.data.archived,
        html_url:  response.data.html_url,
        is_fork: response.data.fork,
        last_pushed_at: response.data.pushed_at,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(output),
          },
        ],
        structuredContent: output,
      };
    },
  );
}

export { registerTools };
