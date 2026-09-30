import { McpServer } from "@modelcontextprotocol/server";
import { type Config } from "./config.js";
import { registerGetRepository } from "./tools/getRepository.tool.js";
import { registerListPullRequests } from "./tools/listPullRequests.tool.js";


function registerTools(server: McpServer, config: Config) {
  registerGetRepository(server, config);
  registerListPullRequests(server, config);
}

export { registerTools };
