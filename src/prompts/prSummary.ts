import type { PullRequestContext } from "../github/pullRequest.js";

export function buildPrSummaryPrompt(pr: PullRequestContext, diffText: string): string {
  return [
    "Summarize this pull request in concise markdown for a PR body update.",
    "Be brief and reviewer-friendly.",
    "Do not repeat the PR title.",
    "Do not restate file inventories or repository history.",
    "Keep the full response under 220 words.",
    "Use short bullets, not long paragraphs.",
    "Limit each section to at most 3 bullets.",
    "If rationale is obvious from the diff, keep it to 1 bullet.",
    "If testing details are not present, suggest only the 1-2 most relevant checks.",
    "Return only these sections in this order:",
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
