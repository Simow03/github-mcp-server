import { McpServer } from "@modelcontextprotocol/server";
import {
  getRepositoryInputSchema,
  getRepositoryOutputSchema,
} from "./schemas/getRepository.schema.js";
import type { GetRepositoryOutput } from "./schemas/getRepository.schema.js";
import { config } from "./protocol/config.js";
import { GithubErrorHandler } from "./utils.js";

async function registerTools(server: McpServer) {
  server.registerTool(
    "get_repository",
    {
      title: "get repository",
      description:
        "get metadata about a github repository, including its description, default branch, visibility, archive status, fork status, url, and last push timestamp.",
      inputSchema: getRepositoryInputSchema,
      outputSchema: getRepositoryOutputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async ({ owner, repo }) => {
      let response;
      try {
        response = await config.octokit.request("GET /repos/{owner}/{repo}", {
          owner,
          repo,
          headers: {
            "X-GitHub-Api-Version": "2026-03-10",
          },
        });
      } catch (err) {
        return GithubErrorHandler(err, `${owner}/${repo}`);
      }

      const output: GetRepositoryOutput = {
        description: response.data.description,
        default_branch: response.data.default_branch,
        visibility:
          response.data.visibility === "public" ? "public" : "private",
        archived: response.data.archived,
        html_url: response.data.html_url,
        is_fork: response.data.fork,
        last_pushed_at: response.data.pushed_at,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(output)},],
        structuredContent: output,
      };
    },
  );
}

export { registerTools };
