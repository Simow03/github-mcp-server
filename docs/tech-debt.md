# Tech debt

Known gaps that are deliberately deferred. Each entry names the evidence, why it
matters, and the trigger that should make us fix it. Keep entries short and
evidence-based (`file:line` or a command), and delete anything that stops
mattering.

Review this file at the start of each phase and before a release. When an item is
fixed, move it to **Resolved** with the commit.

## Testing

| ID | Debt | Evidence | Impact | Trigger / fix |
| :-- | :-- | :-- | :-- | :-- |
| T1 | The modern (2026-07-28) server path is untested | `tests/helpers/createTestClient.ts:18-19` pairs `InMemoryTransport`; the [SDK v2 testing page](https://ts.sdk.modelcontextprotocol.io/v2/testing.html) documents that only for 2025-era pairs. No test uses `createMcpHandler` / `handler.fetch`. | A transport/handler regression can ship with a green suite. | Next test session: one `handler.fetch` end-to-end test. |
| T2 | The server is never closed | `tests/helpers/createTestClient.ts:11,22,26` create and connect a server per test, but `close` only closes the client. | Leaked transports/timers in watch mode; cross-test flakiness. | Next test session: await both `server.close()` and `client.close()`. |
| T3 | `runConfig` and the retry policy have no test | `tests/utils.test.ts:9-135` covers mapping only; `src/config.ts:11-33` sets `doNotRetry`, throttle callbacks and `X-GitHub-Api-Version`. `grep -rn runConfig tests` returns nothing. | Dropping a status from `doNotRetry` or changing the API version goes unnoticed. | Next test session: stub Octokit and assert the defaults, or drive one 403/429 through the client. |
| T4 | `textOf` uses an unchecked cast | `tests/helpers/createError.ts:3-4` casts `content` to an array and indexes `[0]`. | A wrong result shape throws `TypeError` instead of a readable assertion. | When a second result helper appears: narrow or validate `content`. |
| T5 | Output fixtures duplicate source fixtures | `tests/fixtures/response.ts:1,11` re-declare the shape of `tests/fixtures/repository.ts:3,14`. | Source and output drift is silent. | Next new tool: derive one fixture from the other or use a builder. |
| T6 | `noUnusedLocals` cannot be enabled | `src/protocol/jsonRpc.ts:29,50` are unused; verified with `npx tsc -p tsconfig.test.json --noUnusedLocals` → 2× TS6196. | Unused test imports/types creep back in. | When `jsonRpc.ts` is removed: enable the flag in `tsconfig.test.json`. |
| T7 | Nothing guards stdout cleanliness | `src/index.ts:17,22` log to stderr; verified `GITHUB_PAT= node build/index.js` → 0 stdout bytes. | One stray `console.log` breaks the stdio protocol silently. | Before adding a log: a smoke test asserting stdout is empty. |

## Tooling, dependencies, CI

| ID | Debt | Evidence | Impact | Trigger / fix |
| :-- | :-- | :-- | :-- | :-- |
| D1 | The client SDK ships as a runtime dependency | `package.json:27`; only imported by `tests/helpers/createTestClient.ts:1`. | Production installs carry test-only code. | Before the first publish: move to `devDependencies`. |
| D3 | The engine floor accepts unsupported Node versions | `package.json:34` is `>=22.12`, but installed vitest 5.0.3 requires `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`; npm only warns by default. | Contributors on Node 23/25 hit confusing failures. | With the CI matrix: mirror the vitest range, or add `engine-strict`. |
| D4 | No formatter/linter, and several files lack a final newline | No Prettier/ESLint in `package.json`; no final LF in `.gitignore`, `vitest.config.js`, `tests/fixtures/repository.ts`, `README.md`, `docs/learning-notes.md` (verified last byte). | Noisy diffs and style drift. | Formatter day: Prettier with `endOfLine: lf`, then reformat once. |

## Code

| ID | Debt | Evidence | Impact | Trigger / fix |
| :-- | :-- | :-- | :-- | :-- |
| C1 | Dead hand-rolled JSON-RPC module | `src/protocol/jsonRpc.ts` is imported nowhere (`grep -rn jsonRpc src tests` is empty); it duplicates SDK types. | Confusion, and it blocks T6. | Next cleanup: delete the file. |
| C2 | Dotenv is initialised twice | `src/config.ts:1` runs the side-effect import, then `:5` calls `configDotenv({ quiet: true })`. The banner still prints on stderr. | The `quiet` option is defeated; the banner appears before any error. | Next config touch: drop line 1 and keep `configDotenv({ quiet: true })`. |
| C3 | `main()` runs at import | `src/index.ts:20`; importing `src/index.ts` requires `GITHUB_PAT` and opens stdio. | An index-level integration test is impossible as-is. | If an index test is added: guard with an `import.meta.url` main check. |

## Docs

| ID | Debt | Evidence | Impact | Trigger / fix |
| :-- | :-- | :-- | :-- | :-- |
| Doc1 | README onboarding stops at Inspector | `README.md:77` has a TODO for a first call. | The reader has no concrete first request. | Next docs pass: one `get_repository` example on a public repo. |
| Doc2 | Learning notes list unimplemented tools | `docs/learning-notes.md:18,20` describe `list_issues` and `get_issue`; only `get_repository` and `list_pull_requests` exist (`README.md:32-33`). | The notes imply shipped tools that are not there. | Next docs pass: mark planned vs shipped. |
| Doc3 | Broken "Safe by design" sentence | `README.md:20` ("... they can't modify on GitHub. or write to give access ..."). | A safety claim is hard to parse. | Next docs pass: rewrite the bullet. |

## Resolved

| Date | Item | Commit |
| :-- | :-- | :-- |
| 2026-11-04 | Tests are type-checked: `tsconfig.test.json` + `npm run typecheck` exits 0. | `38f530c` |
| 2026-11-04 | Latent NodeNext import fixed (`tests/fixtures/repository.ts:1` → `./pullRequest.js`); unused test import and mock removed. | `38f530c` |
| 2026-11-04 | Node engine aligned with vitest (`package.json:34`, README Requirements). | `d16a625` |
| 2026-11-04 | README Architecture section with a concrete diagram (`docs/assets/architecture.png`); image renamed; `docs/learning-notes.md:9` fixed. | `0a6eaf0` |
| 2026-11-09 | CI is present and the actions `npm ci`, `typecheck`, `test`, `build` run on push/PR. | `913fbf2q` |