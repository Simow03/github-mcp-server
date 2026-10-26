#!/usr/bin/env node

import { createServer } from "./server.js";
import { runConfig } from "./config.js";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

//main function to run the server
async function main() {
  const config = runConfig();

  const server = createServer(config);

  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("GitHub MCP Server is running on stdio");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal: error at main(): ${message}`);
  process.exitCode = 1;
});
