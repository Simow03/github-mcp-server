import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import "dotenv/config";

import { registerTools } from "./registerTools";



//create server instance
const server = new McpServer({
  version: "1.0.0",
  name: "github",
});

//main function to run the server
async function main() {
  const transport = new StdioServerTransport();

  registerTools(server);

  await server.connect(transport);
  console.error("GitHub MCP Server is running on stdio");
}

main().catch((error) => {
  console.error("Fatal: error at main(): ", error);
  process.exitCode = 1;
});
