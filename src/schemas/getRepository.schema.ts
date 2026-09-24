import { z } from "zod";

export const getRepositoryInputSchema = z.object({
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
});

export const getRepositoryOutputSchema = z.object({
  description: z.string().nullable(),
  default_branch: z.string(),
  visibility: z.literal(["public", "private"]),
  archived: z.boolean().describe("whether the repository is archived or not."),
  html_url: z.url(),
  is_fork: z.boolean().describe("whether the repository is a fork or not."),
  last_pushed_at: z
    .string()
    .describe(
      "the timestamp for the most recent push to the repository in ISO 8601 format.",
    ),
});

export type GetRepositoryOutput = z.infer<typeof getRepositoryOutputSchema>;
