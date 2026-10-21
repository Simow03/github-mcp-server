import { describe, expect, test } from "vitest";
import {
  hasNextPage,
  handleVisibility,
  GithubErrorHandler,
} from "../src/utils.js";
import { RequestError } from "octokit";

describe("hasNextPage", () => {
  test("undefined value", () => {
    expect(hasNextPage(undefined)).toBe(false);
  });

  test('header link containing rel="next"', () => {
    const link = `<https://github.com>; rel="next", <https://github.com>; rel="last", <https://github.com>; rel="first", <https://github.com>; rel="prev"`;
    expect(hasNextPage(link)).toBe(true);
  });

  test('header link with no rel="next"', () => {
    const link = `<https://github.com>; rel="last", <https://github.com>; rel="first", <https://github.com>; rel="prev"`;
    expect(hasNextPage(link)).toBe(false);
  });
});

describe("handleVisibility", () => {
  test("undefined value", () => {
    expect(handleVisibility(undefined, true)).toBe("private");
    expect(handleVisibility(undefined, false)).toBe("public");
  });

  test("known values", () => {
    expect(handleVisibility("private", true)).toBe("private");
    expect(handleVisibility("public", false)).toBe("public");
    expect(handleVisibility("internal", false)).toBe("internal");
  });
});

describe("GithubErrorHandler", () => {
  const target = "name/repo";

  function createError(status: number, headers: Record<string, string> = {}) {
    return new RequestError(`HTTP ${status}`, status, {
      request: { method: "GET", url: "", headers: {} },
      response: { status, headers, url: "", data: {} },
    });
  }

  function textOf(result: ReturnType<typeof GithubErrorHandler>) {
    return result.content[0].text;
  }
  test("a non RequestError instance", () => {
    const error = GithubErrorHandler(new Error("test"), target);
    expect(textOf(error)).toContain("Unexpected error while fetching");
    expect(error.isError).toBe(true);
  });

  describe("RequestError instances", () => {
    test("404 status", () => {
      const error = GithubErrorHandler(createError(404), target);
      expect(textOf(error)).toContain(`Repository ${target} was not found.`);
      expect(error.isError).toBe(true);
    });
    test("401 status", () => {
      const error = GithubErrorHandler(createError(401), target);
      expect(textOf(error)).toContain(
        `Github rejected the server's credentials.`,
      );
      expect(error.isError).toBe(true);
    });
    test("451 status", () => {
      const error = GithubErrorHandler(createError(451), target);
      expect(textOf(error)).toContain(
        `${target} is unavailable for legal reasons.`,
      );
      expect(error.isError).toBe(true);
    });

    describe("403 and 429", () => {
      test.each([403, 429])("%i with primary rate-limit headers", (status) => {
        const primaryLimit = {
          "x-ratelimit-remaining": "0",
          // 1700000000 seconds since epoch = 2023-11-14T22:13:20.000Z
          "x-ratelimit-reset": "1700000000",
        };
        const error = GithubErrorHandler(
          createError(status, primaryLimit),
          target,
        );
        expect(textOf(error)).toContain(`Github rate limit reached.`);
        expect(textOf(error)).toContain("2023-11-14T22:13:20.000Z");
      });

      test.each([403, 429])("%i with retry-after header", (status) => {
        const error = GithubErrorHandler(
          createError(status, { "retry-after": "60" }),
          target,
        );
        expect(textOf(error)).toContain("Retry after 60 seconds");
      });
      test("429 with no headers waits one minute", () => {
        const error = GithubErrorHandler(createError(429), target);
        expect(textOf(error)).toContain("Wait at least one minute");
      });

      test("403 with no headers is a permission problem", () => {
        const error = GithubErrorHandler(createError(403), target);
        expect(textOf(error)).toContain("not allowed to read");
      });

      test("403 with x-ratelimit-remaining !== 0 is not treated as rate limiting", () => {
        const result = GithubErrorHandler(
          createError(403, {
            "x-ratelimit-remaining": "4999",
            "x-ratelimit-reset": "1700000000",
          }),
          target,
        );
        expect(textOf(result)).toContain("not allowed to read");
        expect(textOf(result)).not.toContain("Github rate limit reached.");
      });
    });

    test.each([500, 502, 503, 504])("%i is temporary", (status) => {
      const error = GithubErrorHandler(createError(status), target);
      expect(textOf(error)).toContain(
        `failed temporarily with status ${status}`,
      );
    });
    test.each([400, 406, 410, 422])(
      "%i uses the generic error message",
      (status) => {
        const error = GithubErrorHandler(createError(status), target);
        expect(textOf(error)).toContain(`error of a status ${status}`);
      },
    );
  });
});
