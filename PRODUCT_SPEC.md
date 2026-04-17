# PR-Insight Agent Product Specification

## 1. Purpose

PR-Insight Agent is a GitHub Action built with Node.js and TypeScript that analyzes pull requests to:

- generate structured PR descriptions
- detect documentation drift and suggest Markdown updates
- surface risk and impact signals for reviewers

The action is designed to be model-provider agnostic so users can plug in their own AI model, API key, and optional base URL.

## 2. Problem Statement

Pull requests often ship with incomplete descriptions, outdated documentation, and limited reviewer context. This creates review friction, increases the chance of regressions, and makes repository knowledge harder to maintain.

PR-Insight Agent reduces that friction by automatically producing reviewer-friendly summaries and doc-sync feedback directly inside the GitHub pull request workflow.

## 3. Goals

- Generate consistent PR descriptions when a pull request is opened.
- Compare code changes against repository documentation when `DOCS_PATH` is configured.
- Highlight likely regressions, breaking changes, or performance risks.
- Support multiple AI providers through runtime configuration.
- Run as a reusable GitHub Action without requiring code changes for model swaps.

## 4. Non-Goals

- Replacing human code review or approval workflows.
- Editing arbitrary source files outside the PR feedback flow.
- Acting as a full semantic documentation generator for entire repositories.
- Supporting every LLM provider in the first release.

## 5. Primary Users

- Repository maintainers who want better PR hygiene.
- Engineers who want auto-generated PR descriptions.
- Teams that want lightweight documentation consistency checks.
- Organizations experimenting with different AI vendors or self-hosted endpoints.

## 6. Core Use Cases

### 6.1 Automated PR Description

When a pull request is created, the action fetches PR metadata, commit messages, and diff content, then generates a structured PR summary that can be posted as a PR body update or a PR comment.

### 6.2 Documentation Synchronization

When `DOCS_PATH` is provided, the action reads matching documentation files and compares them against the changed code. If inconsistencies are found, it produces targeted Markdown update suggestions.

### 6.3 No-Doc Mode

When `DOCS_PATH` is omitted or empty, the action skips the documentation comparison and only runs PR description generation plus risk analysis.

### 6.4 Risk and Impact Analysis

The action flags likely issues such as but not limited to:

- breaking API behavior
- hidden regressions
- performance-sensitive logic changes
- missing testing coverage areas (if test cases are present)
- function definition updated but usage not updated everywhere else
- any other likely bugs

## 7. Functional Requirements

### 7.1 Triggering

- The initial workflow trigger is `pull_request` on creation.
- The design should allow future extension to events like `synchronize` and `edited`.

### 7.2 Inputs and Configuration

The action must support the following runtime inputs or environment values:

- `AI_MODEL_NAME` (required): model identifier such as `gpt-4o`, `gemini-1.5-flash`, or `llama3-70b-8192`
- `AI_API_KEY` (required): provider credential
- `AI_BASE_URL` (optional): custom endpoint or proxy
- `DOCS_PATH` (optional): file path, directory, or glob pattern for docs content

Recommended future optional inputs:

- `GITHUB_TOKEN`
- `MAX_DIFF_SIZE`
- `OUTPUT_MODE` (`comment`, `pr-body`, or both)
- `FAIL_ON_AI_ERROR`

### 7.3 GitHub Context Retrieval

The action must:

- identify the current pull request from the workflow context
- fetch PR metadata using the GitHub API
- retrieve changed files and diff content
- collect commit messages relevant to the PR

### 7.4 AI Analysis

The action must send structured prompts to the configured provider for:

- PR summarization
- documentation drift analysis when enabled
- risk and impact analysis

The AI layer must be abstracted so provider-specific request formatting is isolated behind a shared interface.

### 7.5 Output Format

The PR summary should include:

- summary of intent
- key code changes
- rationale or inferred purpose
- testing suggestions

The documentation sync result should include:

- whether documentation appears aligned
- specific files affected
- suggested Markdown updates when drift is detected

The risk analysis should include:

- severity or confidence label if available
- identified risk areas
- suggested reviewer checks

### 7.6 Failure Handling

If the AI request fails, the action must:

- log a clear provider-specific error
- avoid corrupting the PR body
- optionally continue with partial outputs when safe

If `DOCS_PATH` matches no files, the action should:

- log a non-fatal message
- continue in no-doc mode unless configured otherwise

## 8. Quality Attributes

### 8.1 Configurability

Users must be able to switch models or providers without changing core source code.

### 8.2 Observability

The action should produce structured logs for:

- GitHub fetch stage
- docs discovery stage
- AI request stage
- output publishing stage
- error conditions

### 8.3 Security

- API keys must come from GitHub secrets or equivalent secure inputs.
- Sensitive tokens must never be written to logs.
- External requests should be limited to the configured provider endpoint.

### 8.4 Performance

- Large diffs should be trimmed, chunked, or summarized before model submission when necessary.
- The workflow should degrade gracefully when token or payload limits are reached.

## 9. High-Level Architecture

### 9.1 Workflow Layer

GitHub Actions workflow file that triggers on pull request events and passes required inputs to the Node.js runtime.

### 9.2 Context Layer

Module responsible for reading workflow context and fetching PR metadata, file diffs, and commits using `@octokit/rest`.

### 9.3 Docs Layer

Module that resolves `DOCS_PATH`, reads matching Markdown files, and prepares documentation content for analysis.

### 9.4 AI Provider Layer

Provider abstraction with adapters for:

- OpenAI-compatible APIs
- Google Gemini
- Groq

This layer normalizes requests and responses into a shared internal schema.

### 9.5 Prompt and Analysis Layer

Builds prompts for:

- PR description
- documentation sync
- risk analysis

### 9.6 Publisher Layer

Posts results back to GitHub by:

- updating the PR body
- posting a comment

## 10. Data Flow

1. GitHub Action starts on pull request creation.
2. Runtime loads config and validates required inputs.
3. GitHub client fetches PR metadata, changed files, and commits.
4. Docs resolver optionally reads documentation files from `DOCS_PATH`.
5. Prompt builder assembles analysis requests.
6. Provider client sends requests to the configured AI endpoint.
7. Response parser normalizes outputs.
8. Publisher updates the PR body and/or comment thread.
9. Logger records success, warnings, and failures.

## 11. Suggested Repository Structure

```text
.github/
  workflows/
    pr-agent.yml
src/
  index.ts
  config/
    env.ts
  github/
    client.ts
    pullRequest.ts
  docs/
    resolver.ts
    reader.ts
  ai/
    types.ts
    client.ts
    providers/
      openai.ts
      gemini.ts
      groq.ts
  prompts/
    prSummary.ts
    docSync.ts
    riskAnalysis.ts
  output/
    publisher.ts
    formatters.ts
  utils/
    logger.ts
    errors.ts
tests/
```

## 12. Acceptance Criteria

### MVP Acceptance Criteria

- A pull request event triggers the workflow successfully.
- The action validates `AI_MODEL_NAME` and `AI_API_KEY`.
- The action fetches PR diff data and commit messages.
- The action generates a structured PR summary using the configured model.
- When `DOCS_PATH` is set and files are found, the action evaluates doc alignment and returns suggestions.
- When `DOCS_PATH` is empty or no files are found, the action skips doc sync without failing.
- The action produces a risk analysis section.
- The action publishes results back to GitHub as a comment, PR body update, or both.
- Errors from provider calls are logged clearly without leaking secrets.

## 13. Open Questions

- PR description generation should append to the existing PR body rather than overwrite it.
- Documentation synchronization should publish findings as comments in the MVP; auto-generated patch proposals are a future enhancement.
- The initial diff analysis limit should be `1,500 changed lines` or `60 KB` of diff text, whichever is reached first.
- Provider integration should use a mixed strategy so the system can combine HTTP-based adapters with provider-specific implementations when helpful.
- The default publishing mode for the first release should be split output:
  - append the PR summary to the PR body
  - publish risk analysis and doc-sync findings as separate PR comments

## 14. Future Enhancements

- support `pull_request.synchronize`
- style-guide-aware PR descriptions
- Slack or chat notifications
- auto-generated docs patch files
- confidence scoring and reviewer routing
- local development mode using Ollama
