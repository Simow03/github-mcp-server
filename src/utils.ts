import { RequestError } from "octokit";

export function handleVisibility(
  visibility: string | undefined,
  isPrivate: boolean,
): "private" | "public" | "internal" {
  if (
    visibility === "private" ||
    visibility === "public" ||
    visibility === "internal"
  ) {
    return visibility;
  }

  //if data.visibility is missing or unrecognized, fallback to the data.private
  return isPrivate ? "private" : "public";
}

function toolError(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
    isError: true,
  };
}

export function hasNextPage(linkHeader: string | undefined): boolean {
  if (!linkHeader) return false;
  return /<[^>]+>;\s*rel="next"/.test(linkHeader);
}

export function GithubErrorHandler(err: unknown, target: string) {
  //this wraps all unexpected error like dns, timeout, connection drop.
  if (!(err instanceof RequestError)) {
    return toolError(
      `Unexpected error while fetching ${target}. Try again later.`,
    );
  }

  //extract octokit headers; useful for rate limiting error
  const headers = err.response?.headers ?? {};

  //treat each request fail accordingly
  switch (err.status) {
    case 404:
      return toolError(
        `Repository ${target} was not found. Check the spelling of the owner and repo and try again. If it is private, the server's token may not have access to it.`,
      );
    case 401:
      return toolError(
        `Github rejected the server's credentials. This is a server configuration problem so don't retry again. Tell the user that the token is either missing, expired or revoked.`,
      );
    case 403:
    case 429: {
      if (
        headers["x-ratelimit-remaining"] === "0" &&
        headers["x-ratelimit-reset"]
      ) {
        const reset = new Date(
          Number(headers["x-ratelimit-reset"]) * 1000,
        ).toISOString();
        return toolError(
          `Github rate limit reached. It resets at ${reset}. Do not retry before then.`,
        );
      }
      if (headers["retry-after"]) {
        return toolError(
          `Github is throttling requests. Retry after ${headers["retry-after"]} seconds.`,
        );
      }
      /*
        split the fallback to look for the status code each at it's own:
        - 429 : can happen without a header, but it always means rate limiting and nothing else.
        - 403 : is ambiguous and can be used as both rate limiting and permission issues. So without
          the rate limiting headers, it's only safe to use it as the last fallback for permission problems.
      */
      if (err.status === 429) {
        return toolError(
          `Github is throttling requests. Wait at least one minute before retrying.`,
        );
      }
      return toolError(
        `The server's token is not allowed to read ${target}. Could be missing scope or org SSO authorization.`,
      );
    }
    case 451:
      return toolError(`${target} is unavailable for legal reasons.`);
    default:
      if (err.status >= 500) {
        return toolError(
          `Github or the network failed temporarily with status ${err.status}. Retrying later may work.`,
        );
      }
      return toolError(
        `Github returned an error of a status ${err.status} for ${target}.`,
      );
  }
}
