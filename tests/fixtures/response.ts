export const repositoryFixtureResponse = {
  description: null,
  default_branch: "main",
  visibility: "public",
  archived: false,
  html_url: "https://github.com/o/r",
  is_fork: false,
  last_pushed_at: "2026-09-01T00:00:00Z",
};

export const pullRequestsFixtureResponse = {
  pull_requests: [
    {
      number: 12,
      title: "Add list_pull_requests tool",
      state: "open",
      merged: false,
      draft: false,
      author: "Simow03",
      head_ref: "feature/list-pull-requests",
      base_ref: "main",
      html_url: "https://github.com/o/r/pull/12",
      created_at: "2026-09-28T10:00:00Z",
      updated_at: "2026-09-29T08:30:00Z",
      merged_at: null,
    },
    {
      number: 7,
      title: "Fix build imports",
      state: "closed",
      merged: true,
      draft: false,
      author: null,
      head_ref: "fix/imports",
      base_ref: "main",
      html_url: "https://github.com/o/r/pull/7",
      created_at: "2026-09-20T09:00:00Z",
      updated_at: "2026-09-21T14:00:00Z",
      merged_at: "2026-09-21T14:00:00Z",
    },
  ],
  has_more: false,
};

export const pullRequestsClosedFixtureResponse = {
  pull_requests: [
    {
      number: 7,
      title: "Fix build imports",
      state: "closed",
      merged: true,
      draft: false,
      author: null,
      head_ref: "fix/imports",
      base_ref: "main",
      html_url: "https://github.com/o/r/pull/7",
      created_at: "2026-09-20T09:00:00Z",
      updated_at: "2026-09-21T14:00:00Z",
      merged_at: "2026-09-21T14:00:00Z",
    },
  ],
  has_more: false,
};
export const pullRequestsOpenFixtureResponse = {
  pull_requests: [
    {
      number: 12,
      title: "Add list_pull_requests tool",
      state: "open",
      merged: false,
      draft: false,
      author: "Simow03",
      head_ref: "feature/list-pull-requests",
      base_ref: "main",
      html_url: "https://github.com/o/r/pull/12",
      created_at: "2026-09-28T10:00:00Z",
      updated_at: "2026-09-29T08:30:00Z",
      merged_at: null,
    },
  ],
  has_more: false,
};
