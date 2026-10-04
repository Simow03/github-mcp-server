import { z } from "zod";

export const listPullRequestsInputSchema = z.object({
  owner: z
    .string()
    .describe(
      "The account owner of the repository. The name is not case sensitive.",
    ),
  repo: z
    .string()
    .describe(
      "The name of the repository without the .git extension. The name is not case sensitive.",
    ),
  state: z
    .enum(["open", "closed", "all"])
    .default("open")
    .describe(
      "specifies which pull requests to list: open, closed (includes merged), or all. defaults to open.",
    ),
  base: z
    .string()
    .optional()
    .describe("only list pull requests targeting this specific base branch."),
  limit: z
    .number()
    .int()
    .min(1, { message: "value must be 1 or greater" })
    .max(100, { message: "value cannot exceed 100" })
    .default(30)
    .describe(
      "indicates the maximum number of pull requests to return, from 1 to 100. defaults to 30.",
    ),
});

const pullRequest = z.object({
  number: z.number().int(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  merged: z.boolean(),
  draft: z.boolean(),
  author: z.string().nullable(),
  head_ref: z.string(),
  base_ref: z.string(),
  html_url: z.url(),
  created_at: z.string(),
  updated_at: z.string(),
  merged_at: z.string().nullable(),
});

export const listPullRequestsOutputSchema = z.object({
  pull_requests: z.array(pullRequest),
  //limit only controls how many come back so this helps the model to know when there are more
  has_more: z.boolean().describe("tells the model that the list might be incomplete when true. it shows only limit but GitHub reports another page of results beyond this one."),
});

export type ListPullRequestsOutput = z.infer<
  typeof listPullRequestsOutputSchema
>;
