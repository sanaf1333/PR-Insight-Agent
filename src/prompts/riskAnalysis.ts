import type { PullRequestContext } from "../github/pullRequest.js";

export function buildRiskAnalysisPrompt(
  pr: PullRequestContext,
  diffText: string,
): string {
  return [
    "Review this pull request and produce a concise markdown risk report.",
    "Focus on code-level and behavior-level risks introduced by this PR.",
    "Do not mention generic project setup risks, external service dependency risks, or 'needs live testing' unless directly caused by the changed code.",
    "Prefer concrete findings tied to the diff over broad cautions.",
    "If no meaningful risk is found, say exactly: No significant code-level risks identified.",
    "Keep the full response under 160 words.",
    "Return only these sections in this order:",
    "## Top Risks",
    "## Reviewer Checks",
    "Use at most 3 bullets total in Top Risks.",
    "Use at most 3 bullets in Reviewer Checks.",
    "Each bullet must be one sentence.",
    "",
    "Call out likely bugs, missed usage updates, breaking changes, performance issues, and missing test coverage where relevant.",
    "",
    `PR Title: ${pr.title}`,
    "",
    "Diff:",
    diffText,
  ].join("\n");
}
