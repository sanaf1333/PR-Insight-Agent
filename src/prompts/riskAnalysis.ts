import type { PullRequestContext } from "../github/pullRequest.js";

export function buildRiskAnalysisPrompt(
  pr: PullRequestContext,
  diffText: string,
): string {
  return [
    "Review this pull request and produce a concise markdown risk report.",
    "Return these sections:",
    "## Risk Summary",
    "## Potential Regressions",
    "## Reviewer Checks",
    "",
    "Call out likely bugs, missed usage updates, breaking changes, performance issues, and missing test coverage where relevant.",
    "",
    `PR Title: ${pr.title}`,
    "",
    "Diff:",
    diffText,
  ].join("\n");
}
