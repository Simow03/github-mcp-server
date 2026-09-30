import { McpServer } from "@modelcontextprotocol/server";
import type { Config } from "../config.js";
import {
  listPullRequestsInputSchema,
  listPullRequestsOutputSchema,
  type ListPullRequestsOutput,
} from "../schemas/listPullRequests.schema.js";
import { GithubErrorHandler } from "../utils.js";

export function registerListPullRequests(server: McpServer, config: Config) {
  server.registerTool(
    "list_pull_requests",
    {
      title: "list pull requests",
      description:
        "list pull requests in a github repository. returns each pull request's number, title, state, author, draft status, head and base branches, url, and created/updated timestamps.",
      inputSchema: listPullRequestsInputSchema,
      outputSchema: listPullRequestsOutputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async ({ owner, repo, state, base, limit }) => {
      let response;
      try {
        response = await config.octokit.request(
          "GET /repos/{owner}/{repo}/pulls",
          {
            owner,
            repo,
            state,
            base,
            per_page: limit,
            headers: {
              "X-GitHub-Api-Version": "2026-03-10",
            },
          },
        );
      } catch (err) {
        return GithubErrorHandler(err, `${owner}/${repo}`);
      }

      const output: ListPullRequestsOutput = {
        pull_requests: response.data.map((pr) => ({
            number: pr.number,
            title: pr.title,
            state: pr.state === "open" ? "open" : "closed",
            merged: pr.merged_at !== null,
            draft: pr.draft ?? false,
            author: pr.user?.login ?? null,
            head_ref: pr.head.ref,
            base_ref: pr.base.ref,
            html_url: pr.html_url,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            merged_at: pr.merged_at
        })),
        has_more: response.data.length === limit,
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
