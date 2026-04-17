import type { PullRequestContext } from "../github/pullRequest.js";

export function buildPrSummaryPrompt(pr: PullRequestContext, diffText: string): string {
  return [
    "Summarize this pull request in markdown.",
    "Return these sections:",
    "## Summary",
    "## Key Changes",
    "## Rationale",
    "## Testing Suggestions",
    "",
    `Title: ${pr.title}`,
    `Base: ${pr.baseRef}`,
    `Head: ${pr.headRef}`,
    "",
    "Commit Messages:",
    pr.commits.map((commit) => `- ${commit}`).join("\n") || "- None",
    "",
    "Diff:",
    diffText,
  ].join("\n");
}
