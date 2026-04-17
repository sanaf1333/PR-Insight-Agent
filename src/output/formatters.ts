import type { AppConfig } from "../config/env.js";

export const SUMMARY_START_MARKER = "<!-- pr-insight:summary:start -->";
export const SUMMARY_END_MARKER = "<!-- pr-insight:summary:end -->";
export const RISK_COMMENT_MARKER = "<!-- pr-insight:risk-comment -->";
export const DOC_SYNC_COMMENT_MARKER = "<!-- pr-insight:doc-sync-comment -->";

export interface DiffLimitResult {
  diffText: string;
  truncated: boolean;
  truncatedReason?: string;
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripLeadingHeading(text: string): string {
  return text.replace(/^#{1,3}\s+PR-Insight[^\n]*\n+/i, "").trim();
}

function findSection(text: string, heading: string): string | undefined {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `^##\\s+${escapedHeading}\\s*\\n([\\s\\S]*?)(?=^##\\s+|\\s*$)`,
    "im",
  );
  return text.match(regex)?.[1]?.trim();
}

function limitBullets(section: string, maxBullets: number): string {
  const lines = section
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const bulletLines = lines.filter((line) => /^[-*]\s+/.test(line));
  if (bulletLines.length === 0) {
    return lines.slice(0, 2).join("\n");
  }

  return bulletLines.slice(0, maxBullets).join("\n");
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

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildSummarySection(summary: string): string {
  const normalizedSummary = normalizeSummary(summary);
  return [
    SUMMARY_START_MARKER,
    "## PR-Insight Summary",
    "",
    normalizedSummary,
    SUMMARY_END_MARKER,
  ].join("\n");
}

export function buildSummaryAppend(existingBody: string, summary: string): string {
  const cleanedBody = existingBody.trim();
  const summarySection = buildSummarySection(summary);
  const existingSummaryPattern = new RegExp(
    `${escapeRegex(SUMMARY_START_MARKER)}[\\s\\S]*?${escapeRegex(
      SUMMARY_END_MARKER,
    )}`,
    "m",
  );

  if (existingSummaryPattern.test(cleanedBody)) {
    return cleanedBody.replace(existingSummaryPattern, summarySection).trim();
  }

  const legacySummaryPattern = /(?:\n\n---\n\n)?## PR-Insight Summary[\s\S]*$/m;
  if (legacySummaryPattern.test(cleanedBody)) {
    return cleanedBody.replace(legacySummaryPattern, `\n\n---\n\n${summarySection}`).trim();
  }

  const separator = cleanedBody ? "\n\n---\n\n" : "";
  return `${cleanedBody}${separator}${summarySection}`.trim();
}

export function buildRiskComment(riskAnalysis: string, note?: string): string {
  return [
    RISK_COMMENT_MARKER,
    "## PR-Insight Risk Analysis",
    note,
    normalizeRiskAnalysis(riskAnalysis),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildDocSyncComment(docSync: string, note?: string): string {
  return [
    DOC_SYNC_COMMENT_MARKER,
    "## PR-Insight Documentation Sync",
    note,
    normalizeDocSync(docSync),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function normalizeSummary(text: string): string {
  const cleaned = normalizeWhitespace(stripLeadingHeading(text));
  return cleaned;
}

export function normalizeRiskAnalysis(text: string): string {
  const cleaned = normalizeWhitespace(stripLeadingHeading(text));
  const topRisks = findSection(cleaned, "Top Risks");
  const reviewerChecks = findSection(cleaned, "Reviewer Checks");

  if (!topRisks && !reviewerChecks) {
    return cleaned;
  }

  return [
    topRisks ? `## Top Risks\n${limitBullets(topRisks, 3)}` : undefined,
    reviewerChecks
      ? `## Reviewer Checks\n${limitBullets(reviewerChecks, 3)}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function normalizeDocSync(text: string): string {
  const cleaned = normalizeWhitespace(stripLeadingHeading(text));

  if (
    /no documentation changes suggested|docs? (appear|is) aligned|documentation (appears|is) aligned/i.test(
      cleaned,
    )
  ) {
    return "No documentation changes suggested.";
  }

  const suggestedUpdates = findSection(cleaned, "Suggested Updates");
  if (!suggestedUpdates) {
    return cleaned;
  }

  const limitedSuggestions = limitBullets(suggestedUpdates, 5);
  if (!limitedSuggestions) {
    return "No documentation changes suggested.";
  }

  return `## Suggested Updates\n${limitedSuggestions}`;
}
