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
    "Do not mention model choice, missing tests, future work, documentation gaps, or architecture quality unless this diff directly introduces an immediate code-level risk from them.",
    "Every Top Risks bullet must describe a concrete changed behavior, changed logic path, changed interface, or changed failure mode.",
    "If the diff mostly scaffolds files and no concrete code-level risk is evident, say exactly: No significant code-level risks identified.",
    "Keep the full response under 120 words.",
    "Return only these sections in this order:",
    "## Top Risks",
    "## Reviewer Checks",
    "Use at most 2 bullets total in Top Risks.",
    "Use at most 2 bullets in Reviewer Checks.",
    "Each bullet must be one sentence.",
    "If Top Risks is 'No significant code-level risks identified.', Reviewer Checks should be at most 1 short bullet or omitted.",
    "",
    "Call out likely bugs, missed usage updates, breaking changes, performance issues, and missing test coverage where relevant.",
    "",
    `PR Title: ${pr.title}`,
    "",
    "Diff:",
    diffText,
  ].join("\n");
}
