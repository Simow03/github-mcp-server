import { RequestError } from "octokit";

export function createError(
  status: number,
  headers: Record<string, string> = {},
) {
  return new RequestError(`HTTP ${status}`, status, {
    request: { method: "GET", url: "https://api.github.com/x", headers: {} },
    response: { status, headers, url: "https://api.github.com/x", data: {} },
  });
}
