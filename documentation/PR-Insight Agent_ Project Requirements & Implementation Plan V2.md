# Project Specification: PR-Insight Agent (AI-Driven Pull Request & Documentation Sync) \- V2

## 1\. Overview

The **PR-Insight Agent** is a GitHub Action-based tool that automates Pull Request (PR) descriptions, documentation synchronization, and risk analysis. It uses LLMs to ensure that the repository's metadata and documentation remain consistent with the latest code changes.

---

## 2\. Core Functional Requirements

### A. Automated PR Description Generation

- **Trigger:** On `pull_request` creation.  
- **Action:** Analyzes git diffs and commit messages.  
- **Output:** Structured summary, rationale, key changes, and testing suggestions.

### B. Documentation Synchronization (The "Doc-Sync" Engine)

- **Flexible Pathing:** Users can specify a `DOCS_PATH` (e.g., `README.md`, `docs/*.md`, or a specific directory).  
- **Intelligent Logic:**  
  - If a `DOCS_PATH` is provided, the agent compares code changes against the documentation content.  
  - If a mismatch is detected, it suggests specific Markdown updates.  
  - **No-Doc Mode:** If no path is provided or the path is empty, the agent skips this step and only performs the PR description and risk analysis.

### C. Risk & Impact Analysis

- **Action:** Flags potential regressions, performance impacts, or breaking changes based on the modified logic.

---

## 3\. Technical Architecture & Integration

### A. Dynamic AI Model Configuration

To ensure flexibility across different providers, the agent uses environment variables for model selection:

- **`AI_MODEL_NAME`**: The identifier (e.g., `gemini-1.5-flash`, `gpt-4o`, `llama3-70b-8192`).  
- **`AI_API_KEY`**: The secret key for the respective AI provider.  
- **`AI_BASE_URL`**: (Optional) For custom endpoints or local proxies.

### B. Integration Workflow

1. **GitHub Action:** Runs a Node.js script in a container.  
2. **Context Retrieval:** Uses `@octokit/rest` to pull PR metadata and diffs.  
3. **AI Interface:** Uses a universal API wrapper (or specific SDKs) to send the diff to the configured model.

### How it is built:

This is built as a **GitHub Action** (using Node.js/TypeScript). You do not build this "inside" your IDE, but you use your IDE to write the code that GitHub will run on its servers.

### Integration Steps:

1. **Workflow File:** Create a `.github/workflows/pr-agent.yml` file in your repository.  
2. **Logic Layer:** A Node.js script (running in the Action) that calls the GitHub API to get the PR diff.  
3. **AI Layer:** The diff is sent to an LLM API (like OpenAI or Anthropic) with a specific system prompt to "Summarize this code change." I should be able to change the AI models anytime by adding model name and API key, so whoever uses it can use their own purchases model.  
4. **Feedback Loop:** The agent uses the GitHub API to post a comment on the PR (for document synchronization and risk analysis) or update the PR body automatically (for PR description generation).

---

## 4\. Implementation Plan for the IDE (Step-by-Step)

### Step 1: The Configurable Listener

*Prompt for IDE:* "Create a GitHub Action using Node.js that accepts inputs for `AI_MODEL_NAME`, `AI_API_KEY`, and an optional `DOCS_PATH`. Use `@octokit/rest` to fetch the current PR diff."

### Step 2: The Logic Parser

*Prompt for IDE:* "Add logic to the Action: If `DOCS_PATH` is provided, read those files. Send both the code diff and the doc content to the LLM (using the model specified in environment variables) and ask it to find discrepancies or generate a PR summary."

### Step 3: The Multi-Provider Brain

*Prompt for IDE:* "Implement a function that handles API calls to different AI providers based on the `AI_MODEL_NAME`. Ensure it supports Google AI (Gemini), OpenAI, and Groq formats. If the API call fails, log a clear error message."

---

## 5\. Recommended Testing Models (Free/Low-Cost)

- **Gemini 1.5 Flash:** Best for large code diffs; high rate limits on the free tier via Google AI Studio.  
- **Groq (Llama 3):** Ideal for speed and high-quality technical summaries.  
- **Ollama:** Best for local development inside your IDE (100% free/private).

---

## 6\. Business & Career Value

- **Performance Review:** Demonstrates technical leadership by automating team documentation and reducing review friction.  
- **Earning Potential:** Can be packaged as a Micro-SaaS where users pay for advanced features like Slack integration or custom "Style Guides" for their PRs.

