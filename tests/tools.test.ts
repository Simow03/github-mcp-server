import { beforeEach, afterEach, describe, expect, test } from "vitest";
import { createTestClient } from "./helpers/createTestClient.js";
import { Client } from "@modelcontextprotocol/client";
import {
  repositoryFixture,
  repositoryFixtureResponse,
} from "./fixtures/repository.js";

let ctx: Awaited<ReturnType<typeof createTestClient>>;

beforeEach(async () => {
  ctx = await createTestClient();
});
afterEach(async () => {
  await ctx.close();
});

test("all tools are present", async () => {
  const { tools } = await ctx.client.listTools();
  expect(tools.map((t) => t.name)).toEqual([
    "get_repository",
    "list_pull_requests",
  ]);
});

describe("get_repository", () => {
  test("maps the Github response to the structuredContent", async () => {
    ctx.request.mockResolvedValueOnce({ data: repositoryFixture });

    const result = await ctx.client.callTool({
      name: "get_repository",
      arguments: { owner: "o", repo: "r" },
    });

    expect(ctx.request).toHaveBeenCalledOnce();
    expect(ctx.request).toHaveBeenCalledWith("GET /repos/{owner}/{repo}",
      expect.objectContaining({owner: "o", repo: "r"})
    )

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject(repositoryFixtureResponse);
  });
});
