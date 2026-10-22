
import { McpServer } from "@modelcontextprotocol/server";
import { registerTools } from "./registerTools.js";
import type { Config } from "./config.js";

export function createServer(config: Config) {
    
  const server = new McpServer({
    version: "0.1.0",
    name: "github",
  });

  registerTools(server, config);

  return server;
}
