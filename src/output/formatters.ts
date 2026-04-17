import type { AppConfig } from "../config/env.js";

export interface DiffLimitResult {
  diffText: string;
  truncated: boolean;
  truncatedReason?: string;
}

export function limitDiff(
  diffText: string,
  config: Pick<AppConfig, "maxDiffBytes" | "maxDiffLines">,
): DiffLimitResult {
  const lines = diffText.split("\n");
  let truncated = false;
  let resultLines = lines;

  if (lines.length > config.maxDiffLines) {
    resultLines = lines.slice(0, config.maxDiffLines);
    truncated = true;
  }

  let limitedText = resultLines.join("\n");
  if (Buffer.byteLength(limitedText, "utf8") > config.maxDiffBytes) {
    limitedText = Buffer.from(limitedText, "utf8")
      .subarray(0, config.maxDiffBytes)
      .toString("utf8");
    truncated = true;
  }

  return {
    diffText: limitedText,
    truncated,
    truncatedReason: truncated
      ? `Diff was truncated to ${config.maxDiffLines} lines / ${config.maxDiffBytes} bytes.`
      : undefined,
  };
}

export function buildSummaryAppend(existingBody: string, summary: string): string {
  const cleanedBody = existingBody.trim();
  const separator = cleanedBody ? "\n\n---\n\n" : "";
  return `${cleanedBody}${separator}## PR-Insight Summary\n\n${summary}`.trim();
}

export function buildRiskComment(riskAnalysis: string, note?: string): string {
  return ["## PR-Insight Risk Analysis", note, riskAnalysis].filter(Boolean).join("\n\n");
}

export function buildDocSyncComment(docSync: string, note?: string): string {
  return ["## PR-Insight Documentation Sync", note, docSync]
    .filter(Boolean)
    .join("\n\n");
}
