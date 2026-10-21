import { describe, expect, test } from "vitest";
import { hasNextPage, handleVisibility } from "../src/utils.js";

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
