# PR-Insight Agent Build Log

## Purpose

This file records the implementation process for PR-Insight Agent, including scaffolding steps, dependency installation, technical decisions, and validation results.

## Steps

### 1. Implementation Start

- Began implementation in the existing repository root.
- Confirmed the repository initially contained only the planning and specification Markdown files.
- Chose to scaffold the project in the current directory, aligned with the approved product spec and implementation plan.

### 2. Initial Technical Decisions

- Runtime: Node.js with TypeScript.
- Workflow target: GitHub Actions on `pull_request`.
- Initial AI provider configuration: Gemini using `gemini-1.5-flash`.
- Credentials strategy: use repository secret `AI_API_KEY`; rely on the default `GITHUB_TOKEN` provided by GitHub Actions.
- Publishing model: append PR summary to the PR body and post risk/doc-sync results as separate comments.
- Provider integration strategy: mixed adapter approach, starting with HTTP-based provider implementations.

### 3. Pending Build Steps

- Scaffold package and TypeScript configuration.
- Install runtime and development dependencies.
- Implement source modules and workflow.
- Add tests and validate the project.

### 4. Bootstrap Actions Completed

- Initialized `package.json` with `npm init -y`.
- Installed runtime dependencies:
  - `@actions/core`
  - `@actions/github`
  - `@octokit/rest`
  - `fast-glob`
  - `zod`
- Installed development dependencies:
  - `typescript`
  - `tsx`
  - `vitest`
  - `@types/node`
  - `eslint`
- Added `tsconfig.json` for strict TypeScript compilation targeting Node.js ESM.
- Added `.gitignore` for `node_modules`, `dist`, and local artifacts.

### 5. Source Structure Implemented

- Added configuration loader in `src/config/env.ts`.
- Added GitHub PR retrieval and publishing helpers in `src/github/`.
- Added docs resolution and file loading modules in `src/docs/`.
- Added AI provider abstractions and provider adapters in `src/ai/`.
- Added prompt builders in `src/prompts/`.
- Added diff limiting and publishing formatters in `src/output/`.
- Added shared logging and error utilities in `src/utils/`.
- Added main workflow entrypoint in `src/index.ts`.

### 6. Workflow Decisions Implemented

- Workflow file created at `.github/workflows/pr-agent.yml`.
- Trigger set to `pull_request` with `opened`, `synchronize`, and `reopened`.
- Workflow permissions configured for PR updates and issue comments.
- Default environment includes:
  - `AI_API_KEY` from repository secrets
  - `GITHUB_TOKEN` from GitHub Actions
  - `AI_MODEL_NAME=gemini-2.5-flash-lite`
  - `DOCS_PATH=README.md,documentation/**/*.md`
  - diff size guardrails for bytes and lines

### 7. Testing Added

- Added formatter-focused tests in `tests/formatters.test.ts`.
- Added docs path resolution tests in `tests/resolver.test.ts`.
- Planned validation steps:
  - run TypeScript build
  - run Vitest
  - fix any compile or runtime issues found

### 8. Validation Results

- First TypeScript build exposed a `rootDir` issue because tests were included in the compiler input. Fixed by limiting the production TypeScript build to `src/**/*.ts`.
- Second TypeScript build exposed an adapter inheritance typing issue in the Groq provider. Fixed by widening the base provider `name` property type.
- Removed generated `.js` test artifacts that were produced during the initial compiler configuration.
- Final validation status:
  - `npm run build`: passed
  - `npm test`: passed
  - editor diagnostics on key files: no issues reported

### 9. Current Constraints And Follow-Up

- The repository is scaffolded and locally validated.
- Live GitHub Action testing requires pushing these changes to the GitHub repository and opening a pull request in that repository.
- No extra GitHub personal token is required for the action itself because GitHub Actions provides `GITHUB_TOKEN` automatically inside workflow runs.
- Creating a separate remote test repository would require authenticated GitHub account access from this environment, which has not been configured here.

### 10. Output Tightening Pass

- Reviewed the first successful PR run and identified that PR summary, risk analysis, and documentation sync outputs were too verbose for normal review workflows.
- Tightened the prompt instructions in:
  - `src/prompts/prSummary.ts`
  - `src/prompts/riskAnalysis.ts`
  - `src/prompts/docSync.ts`
- Added explicit brevity rules such as word budgets, bullet limits, and instructions to avoid repeating file inventories or implementation recaps.
- Changed the doc-sync prompt to prefer only actionable suggested updates, or exactly `No documentation changes suggested.` when docs are already aligned.
- Added formatter-side normalization in `src/output/formatters.ts` so:
  - doc-sync output is collapsed to suggested changes only when possible
  - aligned-docs responses become a single-line no-change result
  - risk output is reduced to compact `Top Risks` and `Reviewer Checks` sections
- Expanded `tests/formatters.test.ts` to cover the new normalization behavior.

### 11. Gemini Availability Hardening

- Observed a live GitHub Actions failure from Gemini with HTTP `503 UNAVAILABLE` during risk analysis generation.
- Confirmed this indicates temporary provider overload rather than a missing `AI_API_KEY`, because the request reached Gemini successfully.
- Switched the default model from `gemini-2.5-flash` to `gemini-2.5-flash-lite` to reduce demand pressure and cost.
- Added retry-with-backoff logic in `src/ai/providers/gemini.ts` for transient `503` and `429` responses.
- Kept the final error message detailed so future provider-side failures remain easy to diagnose from GitHub Actions logs.

### 12. Retry And Upsert Fixes

- Verified that the initial Gemini retry logic used linear delay (`RETRY_DELAY_MS * attempt`) rather than exponential backoff.
- Replaced the delay calculation with exponential backoff plus jitter, capped by a maximum delay, to reduce thundering-herd retries during provider spikes.
- Added test coverage for the retry delay calculation in `tests/gemini.test.ts`.
- Changed PR summary publishing to replace the existing managed summary block in the PR body instead of appending a new summary on every run.
- Added managed HTML comment markers for the PR summary, risk comment, and doc-sync comment.
- Added GitHub comment upsert behavior so existing PR-Insight comments are updated in place instead of creating duplicates on each workflow execution.

### 13. Prompt Refinement Pass

- Reviewed the next live PR output and found that the summary was still slightly too prose-heavy for the PR body.
- Tightened `src/prompts/prSummary.ts` again:
  - reduced the word budget
  - limited Summary to 2 sentences
  - limited Key Changes to 4 bullets
  - discouraged extra overview wording
- Tightened `src/prompts/riskAnalysis.ts` again:
  - pushed the model to report only concrete diff-based risks
  - discouraged generic findings about model choice, missing tests, future work, or architecture unless they create an immediate risk in the changed code
  - reduced word and bullet budgets further
- Tightened `src/prompts/docSync.ts` again:
  - limited suggestions to at most 3 bullets
  - reduced the word budget further to keep documentation comments compact

### 14. Documentation Alignment Pass

- Updated `README.md` with current setup and behavior details:
  - required secret and key environment variables
  - current default model
  - current `DOCS_PATH` pattern
  - update-in-place publishing behavior
- Updated `documentation/PRODUCT_SPEC.md` so output requirements better reflect the current concise summary, diff-based risk comments, and documentation-only doc-sync suggestions.
- Updated `documentation/IMPLEMENTATION_PLAN.md` so the publishing phase reflects split output plus update-in-place behavior instead of duplicate comments.
- Tightened `src/prompts/docSync.ts` again to explicitly forbid suggesting edits to source files, tests, workflows, or other non-documentation paths.

### 15. No-Risk And No-Doc Tuning

- Adjusted `src/prompts/riskAnalysis.ts` so prompt-tuning, formatting, documentation-only, and other non-behavioral changes are more likely to return `No significant code-level risks identified.` instead of a meta-risk.
- Added a stronger guard that tighter wording or shorter outputs should not be treated as a risk unless required behavior is actually removed.
- Adjusted `src/prompts/docSync.ts` so already-updated docs in the same PR are more likely to return `No documentation changes suggested.`
- Added a guard against suggesting changelog or build-log updates unless those files are clearly inaccurate or missing a decision that this PR introduces.
- Expanded `tests/formatters.test.ts` to cover explicit no-risk and no-documentation-change normalization paths.
