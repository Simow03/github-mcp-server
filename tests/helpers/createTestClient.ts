import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { vi } from "vitest";
import type { Config } from "../../src/config.js";
import { createServer } from "../../src/server.js";

export async function createTestClient() {
  const request = vi.fn();

  const config = { octokit: { request } } as unknown as Config;

  const server = createServer(config);

  const client = new Client({
    version: "0.1.0",
    name: "test-harness",
  });

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  return {
    client,
    server,
    request,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}
