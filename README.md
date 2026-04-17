# PR-Insight Agent

PR-Insight Agent is a GitHub Action that analyzes pull requests with an AI model and publishes:

- a concise PR summary in the PR body
- a risk analysis comment
- a documentation sync comment

The action is built with Node.js and TypeScript and currently defaults to Gemini with configurable provider settings.

## Current Behavior

- Runs on `pull_request` events.
- Fetches PR metadata, changed files, patches, and commit messages.
- Limits diff input to `1500` lines or `61440` bytes before sending content to the model.
- Replaces the existing managed PR summary instead of appending duplicates.
- Updates existing PR-Insight comments in place instead of creating new ones every run.
- Keeps outputs intentionally concise:
  - PR summary targets a short body update
  - risk analysis focuses on concrete diff-based risks
  - documentation sync returns only suggested documentation changes or `No documentation changes suggested.`

## Configuration

Required secret:

- `AI_API_KEY`

Common environment variables:

- `AI_MODEL_NAME`
- `AI_BASE_URL`
- `DOCS_PATH`
- `MAX_DIFF_BYTES`
- `MAX_DIFF_LINES`

Current default model:

- `gemini-2.5-flash-lite`

Current docs path pattern used by the workflow:

- `README.md,documentation/**/*.md`

## DOCS_PATH

`DOCS_PATH` controls which documentation files are reviewed for doc-sync suggestions.

Examples:

- `README.md`
- `documentation/**/*.md`
- `README.md,documentation/**/*.md`

Doc-sync suggestions should only target documentation files matched by `DOCS_PATH`.

## Local Validation

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Repository Docs

Additional project documentation lives in `documentation/`:

- `documentation/PRODUCT_SPEC.md`
- `documentation/IMPLEMENTATION_PLAN.md`
- `documentation/BUILD_LOG.md`
