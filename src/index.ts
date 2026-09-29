#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { registerTools } from "./registerTools.js";
import { runConfig } from "./config.js";

//create server instance
const server = new McpServer({
  version: "0.1.0",
  name: "github",
});

//main function to run the server
async function main() {
  const config = runConfig();
  
  const transport = new StdioServerTransport();

  registerTools(server, config);

  await server.connect(transport);
  console.error("GitHub MCP Server is running on stdio");
}

main().catch((error) => {
  console.error("Fatal: error at main(): ", error);
  process.exitCode = 1;
});
