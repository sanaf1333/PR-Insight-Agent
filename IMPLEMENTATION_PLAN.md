# PR-Insight Agent Implementation Plan

## 1. Delivery Strategy

Build the project in small, testable phases:

1. bootstrap the GitHub Action and TypeScript runtime
2. implement PR context retrieval
3. add provider-agnostic AI integration
4. add doc-sync logic
5. add publishing and formatting
6. harden with tests, logging, and edge-case handling

This sequence reduces integration risk and makes it easier to validate each subsystem independently.

## 2. Phase 0: Project Bootstrap

### Objectives

- initialize a Node.js + TypeScript codebase
- define package scripts and build pipeline
- create the GitHub Actions workflow scaffold

### Tasks

- create `package.json`
- add TypeScript configuration
- add source layout under `src/`
- install core dependencies:
  - `@actions/core`
  - `@actions/github`
  - `@octokit/rest`
  - `fast-glob`
- install dev dependencies:
  - `typescript`
  - `tsx` or `ts-node`
  - `vitest` or `jest`
  - `eslint`
- create `.github/workflows/pr-agent.yml`
- create entrypoint `src/index.ts`

### Deliverables

- compilable TypeScript project
- workflow file wired to run on pull request creation

### Exit Criteria

- `npm run build` succeeds
- workflow syntax is valid

## 3. Phase 1: Configuration and Validation

### Objectives

- read runtime configuration safely
- validate required inputs before doing work

### Tasks

- implement `src/config/env.ts`
- read:
  - `AI_MODEL_NAME`
  - `AI_API_KEY`
  - `AI_BASE_URL`
  - `DOCS_PATH`
- define internal config types
- fail fast on missing required values
- redact secrets from logs

### Deliverables

- typed config loader
- reusable validation helpers

### Exit Criteria

- invalid config returns clear errors
- valid config is exposed in a normalized format

## 4. Phase 2: GitHub Pull Request Context Retrieval

### Objectives

- fetch all PR data required for AI analysis

### Tasks

- implement GitHub client wrapper in `src/github/client.ts`
- extract owner, repo, and pull number from action context
- fetch:
  - PR metadata
  - changed files
  - commit messages
  - patch or diff text
- normalize the result into a single internal object
- add defensive handling for empty diffs or missing patch content

### Deliverables

- `PullRequestContext` type
- PR retrieval module usable by the main workflow

### Exit Criteria

- sample PR data can be fetched in local test mode or mocked tests
- output shape is stable and typed

## 5. Phase 3: AI Provider Abstraction

### Objectives

- support multiple AI providers behind one interface

### Tasks

- define provider interfaces in `src/ai/types.ts`
- implement shared client orchestrator in `src/ai/client.ts`
- add provider adapters:
  - `src/ai/providers/openai.ts`
  - `src/ai/providers/gemini.ts`
  - `src/ai/providers/groq.ts`
- map `AI_MODEL_NAME` to provider selection logic
- support optional `AI_BASE_URL` override for compatible endpoints
- normalize provider responses into a common result type
- return actionable error messages on request failure

### Deliverables

- provider-agnostic `generateAnalysis()` flow
- initial support for OpenAI-compatible, Gemini, and Groq endpoints

### Exit Criteria

- each adapter can build a valid request payload
- provider failures surface clear, non-secret errors

## 6. Phase 4: Prompt Design and Response Schema

### Objectives

- produce structured, machine-usable AI outputs

### Tasks

- create prompt builders:
  - `src/prompts/prSummary.ts`
  - `src/prompts/docSync.ts`
  - `src/prompts/riskAnalysis.ts`
- define structured output expectations for:
  - PR summary
  - documentation findings
  - risk findings
- keep prompts concise and deterministic
- add truncation or chunking strategy for oversized diffs

### Deliverables

- reusable prompt modules
- normalized response schema

### Exit Criteria

- prompts generate parseable, sectioned responses
- large diff handling avoids provider payload failures

## 7. Phase 5: Documentation Sync Engine

### Objectives

- compare changed code against selected documentation files

### Tasks

- implement `DOCS_PATH` resolution using files, directories, or globs
- build docs loader in:
  - `src/docs/resolver.ts`
  - `src/docs/reader.ts`
- read Markdown content from matched files
- skip doc-sync cleanly when:
  - `DOCS_PATH` is empty
  - no files match
- send code diff plus doc content to the AI layer
- format discrepancy findings into human-readable suggestions

### Deliverables

- optional doc-sync subsystem
- Markdown update suggestions when drift is detected

### Exit Criteria

- no-doc mode works without failure
- doc mode includes file-aware suggestions

## 8. Phase 6: Output Publishing

### Objectives

- publish useful results back into the pull request

### Tasks

- implement formatting helpers in `src/output/formatters.ts`
- implement GitHub publishing logic in `src/output/publisher.ts`
- support at least one default output mode:
  - PR comment
- optionally support:
  - PR body update
  - dual publish mode
- preserve existing PR content when updating the body unless explicitly configured otherwise

### Deliverables

- renderer for final Markdown output
- publisher that posts analysis to GitHub

### Exit Criteria

- published output is readable and structured
- repeated runs do not create confusing or destructive PR updates

## 9. Phase 7: Logging, Error Handling, and Resilience

### Objectives

- make failures diagnosable without making the action brittle

### Tasks

- implement logger utilities in `src/utils/logger.ts`
- add typed error helpers in `src/utils/errors.ts`
- classify failures into:
  - config errors
  - GitHub API errors
  - file resolution errors
  - AI provider errors
  - publishing errors
- decide when failures are fatal versus non-fatal
- ensure secrets never appear in logs

### Deliverables

- consistent logging model
- clearer action failure behavior

### Exit Criteria

- major failure paths have readable logs
- recoverable failures do not crash the whole workflow unnecessarily

## 10. Phase 8: Testing and Verification

### Objectives

- verify critical flows without overbuilding the test suite

### Recommended Test Areas

- config validation
- provider selection logic
- GitHub PR context normalization
- docs path resolution
- no-doc mode behavior
- output formatting
- AI error handling

### Test Types

- unit tests for config, prompt builders, path resolution, and formatters
- mocked integration tests for GitHub and provider adapters
- manual workflow validation in a sample repository

### Exit Criteria

- core modules have focused tests
- one end-to-end dry run completes against a test pull request

## 11. Suggested Task Breakdown

### Milestone 1: Foundation

- bootstrap repository
- add workflow
- add config loader

### Milestone 2: GitHub Intelligence

- fetch PR data
- normalize diff and commit context

### Milestone 3: AI Core

- implement provider abstraction
- add prompt builders
- produce PR summary

### Milestone 4: Doc-Sync

- resolve docs paths
- compare docs and code changes
- emit suggestions

### Milestone 5: Reviewer Output

- publish comment or PR body update
- add risk analysis formatting

### Milestone 6: Hardening

- add tests
- improve logging
- handle edge cases

## 12. Risks and Mitigations

### Risk: Large Diff Size

Mitigation:

- truncate or chunk diffs
- prioritize changed files with patch data

### Risk: Provider Payload Differences

Mitigation:

- isolate providers behind adapters
- normalize request and response contracts

### Risk: Missing or Ambiguous Docs Matches

Mitigation:

- treat unmatched docs paths as non-fatal
- log exactly what was resolved

### Risk: PR Body Overwrite

Mitigation:

- default to PR comments for MVP
- make body replacement opt-in

### Risk: Noisy AI Output

Mitigation:

- enforce structured prompt sections
- post-process outputs before publishing

## 13. Recommended MVP Scope

For the first working version, implement only:

- `pull_request` trigger on PR creation
- required config loading
- PR metadata and diff retrieval
- one stable output mode, preferably PR comment
- PR summary generation
- doc-sync with `DOCS_PATH`
- risk analysis section
- provider support for OpenAI-compatible, Gemini, and Groq

Defer until later:

- automatic PR body overwrites by default
- advanced chunking heuristics
- Slack integration
- local Ollama integration
- auto-generated documentation patches

## 14. Definition of Done

The MVP is complete when:

- a repository can configure secrets and model name without code changes
- a PR triggers the action successfully
- the action fetches diff and commit context
- the configured provider returns a usable analysis
- the action posts a structured result to the PR
- doc-sync works when docs are configured and skips safely otherwise
- logs are understandable and free of secret leakage
- targeted tests cover the core decision paths

