import { beforeEach, afterEach, describe, expect, test } from "vitest";
import { createTestClient } from "./helpers/createTestClient.js";
import {
  pullRequestsFixture,
  repositoryFixture,
} from "./fixtures/repository.js";
import {
  pullRequestsClosedFixtureResponse,
  pullRequestsFixtureResponse,
  pullRequestsOpenFixtureResponse,
  repositoryFixtureResponse,
} from "./fixtures/response.js";
import { mergedPull, openPull } from "./fixtures/pullRequest.js";
import { createError, textOf } from "./helpers/createError.js";
import { GithubErrorHandler } from "../src/utils.js";

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
    expect(ctx.request).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}",
      expect.objectContaining({ owner: "o", repo: "r" }),
    );

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject(repositoryFixtureResponse);
  });
});

describe("list_pull_requests", () => {
  test("maps the Github response to the structuredContent", async () => {
    ctx.request.mockResolvedValueOnce({
      data: pullRequestsFixture,
      headers: {},
    });

    const result = await ctx.client.callTool({
      name: "list_pull_requests",
      arguments: { owner: "o", repo: "r" },
    });

    expect(ctx.request).toHaveBeenCalledOnce();
    expect(ctx.request).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}/pulls",
      expect.objectContaining({ owner: "o", repo: "r" }),
    );

    const [, params] = ctx.request.mock.calls[0];

    //check default values when not assinged
    expect(params.base).toBeUndefined();
    expect(params.state).toBe("open");
    expect(params.per_page).toBe(30);

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject(pullRequestsFixtureResponse);
  });
  describe("tool arguments", () => {
    describe("state filter", () => {
      test.each([
        {
          state: "open",
          githubReturns: [openPull],
          expected: pullRequestsOpenFixtureResponse,
        },
        {
          state: "closed",
          githubReturns: [mergedPull],
          expected: pullRequestsClosedFixtureResponse,
        },
        {
          state: "all",
          githubReturns: pullRequestsFixture,
          expected: pullRequestsFixtureResponse,
        },
      ])(
        "state=$state is forwarded and the response is mapped",
        async ({ state, githubReturns, expected }) => {
          ctx.request.mockResolvedValueOnce({
            data: githubReturns,
            headers: {},
          });

          const result = await ctx.client.callTool({
            name: "list_pull_requests",
            arguments: { owner: "o", repo: "r", state },
          });

          expect(ctx.request).toHaveBeenCalledOnce();
          expect(ctx.request).toHaveBeenCalledWith(
            "GET /repos/{owner}/{repo}/pulls",
            expect.objectContaining({ owner: "o", repo: "r", state }),
          );
          expect(result.isError).toBeFalsy();
          expect(result.structuredContent).toEqual(expected);
        },
      );
    });
    describe("base filter", () => {
      test.each(["main", "release"])(
        "base=%s is forwarded unchanged",
        async (base) => {
          ctx.request.mockResolvedValueOnce({
            data: pullRequestsFixture,
            headers: {},
          });

          await ctx.client.callTool({
            name: "list_pull_requests",
            arguments: { owner: "o", repo: "r", base },
          });

          expect(ctx.request).toHaveBeenCalledWith(
            "GET /repos/{owner}/{repo}/pulls",
            expect.objectContaining({ base }),
          );
        },
      );
    });
    test.each([1, 30, 100])(
      "limit=%i is sent to GitHub as per_page",
      async (limit) => {
        ctx.request.mockResolvedValueOnce({
          data: pullRequestsFixture,
          headers: {},
        });

        await ctx.client.callTool({
          name: "list_pull_requests",
          arguments: { owner: "o", repo: "r", limit },
        });

        expect(ctx.request).toHaveBeenCalledWith(
          "GET /repos/{owner}/{repo}/pulls",
          expect.objectContaining({ per_page: limit }),
        );
      },
    );
  });

  describe("has_more", () => {
    test.each([
      {
        name: "next link present",
        headers: {
          link: '<https://api.github.com/x?page=2>; rel="next", <https://api.github.com/x?page=5>; rel="last"',
        },
        limit: 30,
        expected: true,
      },
      {
        name: "last page: only prev and first",
        headers: {
          link: '<https://api.github.com/x?page=1>; rel="prev", <https://api.github.com/x?page=1>; rel="first"',
        },
        limit: 30,
        expected: false,
      },
      {
        name: "no link header at all",
        headers: {},
        limit: 30,
        expected: false,
      },
      {
        name: "full page but no link header",
        headers: {},
        limit: 2, // pullRequestsFixture has 2 PRs, so the page is exactly full
        expected: false,
      },
    ])("$name", async ({ headers, limit, expected }) => {
      ctx.request.mockResolvedValueOnce({ data: pullRequestsFixture, headers });

      const result = await ctx.client.callTool({
        name: "list_pull_requests",
        arguments: { owner: "o", repo: "r", limit },
      });

      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toMatchObject({ has_more: expected });
    });
  });
});

describe("tool errors and rejected arguments", () => {
  test.each(["get_repository", "list_pull_requests"])(
    '%s resolves with isError: true and "not found" text',
    async (tool) => {
      ctx.request.mockRejectedValueOnce(createError(404));

      const result = await ctx.client.callTool({
        name: tool,
        arguments: { owner: "o", repo: "r" },
      });

      expect(result.isError).toBeTruthy();
      expect(textOf(result)).toContain(
        "was not found",
      );
    },
  );

  test("list_pull_requests input validation", async () => {

    ctx.request.mockResolvedValueOnce({
      data: pullRequestsFixture,
      headers: {},
    });

    const result = await ctx.client.callTool({
      name: "list_pull_requests",
      arguments: {owner: "o", repo: "r", limit: 500},
    });

    expect(ctx.request).not.toHaveBeenCalled(); 

    expect(result.isError).toBeTruthy();
    expect(textOf(result)).toContain("Input validation error");
  });
});
