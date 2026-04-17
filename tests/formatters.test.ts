import { describe, expect, it } from "vitest";

import {
  buildDocSyncComment,
  buildSummaryAppend,
  limitDiff,
  normalizeDocSync,
  normalizeRiskAnalysis,
} from "../src/output/formatters.js";

describe("limitDiff", () => {
  it("truncates by line count", () => {
    const text = Array.from({ length: 5 }, (_, index) => `line-${index + 1}`).join("\n");

    const result = limitDiff(text, {
      maxDiffBytes: 10_000,
      maxDiffLines: 3,
    });

    expect(result.truncated).toBe(true);
    expect(result.diffText.split("\n")).toHaveLength(3);
  });
});

describe("buildSummaryAppend", () => {
  it("preserves existing body content", () => {
    const result = buildSummaryAppend("Existing body", "New summary");
    expect(result).toContain("Existing body");
    expect(result).toContain("## PR-Insight Summary");
    expect(result).toContain("New summary");
  });
});

describe("buildDocSyncComment", () => {
  it("includes title and note", () => {
    const result = buildDocSyncComment("Doc content", "Note");
    expect(result).toContain("PR-Insight Documentation Sync");
    expect(result).toContain("Note");
    expect(result).toContain("Doc content");
  });
});

describe("normalizeDocSync", () => {
  it("collapses aligned docs responses to a one-line result", () => {
    const result = normalizeDocSync(
      "## Documentation Status\nDocumentation appears aligned with the PR.",
    );

    expect(result).toBe("No documentation changes suggested.");
  });

  it("keeps only suggested update bullets when present", () => {
    const result = normalizeDocSync(
      [
        "## Documentation Status",
        "Docs need updates.",
        "",
        "## Files Reviewed",
        "- README.md",
        "",
        "## Suggested Updates",
        "- Update README.md to mention the new workflow.",
        "- Update documentation/BUILD_LOG.md to note the prompt tightening.",
      ].join("\n"),
    );

    expect(result).toContain("## Suggested Updates");
    expect(result).not.toContain("## Files Reviewed");
    expect(result).toContain("Update README.md");
  });
});

describe("normalizeRiskAnalysis", () => {
  it("keeps only the expected compact sections", () => {
    const result = normalizeRiskAnalysis(
      [
        "## Top Risks",
        "- Risk one.",
        "- Risk two.",
        "- Risk three.",
        "- Risk four.",
        "",
        "## Reviewer Checks",
        "- Check one.",
        "- Check two.",
        "- Check three.",
        "- Check four.",
      ].join("\n"),
    );

    expect(result).toContain("## Top Risks");
    expect(result).toContain("## Reviewer Checks");
    expect(result).not.toContain("Risk four.");
    expect(result).not.toContain("Check four.");
  });
});
