import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { Octokit } from "octokit";
import "dotenv/config";

const GITHUB_PAT = process.env.GITHUB_PAT;

const octokit = new Octokit({ auth: GITHUB_PAT});

//create server instance
const server = new McpServer({
  version: "1.0.0",
  name: "github",
});

//main function to run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  async function getRateLimit() {
    const response = await octokit.request("GET /rate_limit", {
      headers: {
        "X-GitHub-Api-Version": "2026-03-10",
      },
    });

    console.log(response);
  }

  console.error("GitHub MCP Server is running on stdio");
  getRateLimit();
}

main().catch((error) => {
  console.error("Fatal: error at main(): ", error);
  process.exitCode = 1;
});
