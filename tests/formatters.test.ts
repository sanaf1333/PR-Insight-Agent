import { describe, expect, it } from "vitest";

import {
  buildDocSyncComment,
  buildSummaryAppend,
  limitDiff,
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
