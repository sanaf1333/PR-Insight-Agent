import type { DocFile } from "../docs/reader.js";
import type { PullRequestContext } from "../github/pullRequest.js";

export function buildDocSyncPrompt(
  pr: PullRequestContext,
  diffText: string,
  docs: DocFile[],
): string {
  return [
    "Compare the pull request changes with the provided documentation and return only actionable documentation guidance.",
    "Do not summarize the PR, do not explain what files were reviewed, and do not restate implementation details.",
    "If the docs already match the code changes, respond with exactly: No documentation changes suggested.",
    "If documentation updates are needed, respond with only this heading and bullet list:",
    "## Suggested Updates",
    "- one bullet per proposed documentation change",
    "Each bullet must mention the target doc file and the exact change to make.",
    "Use at most 3 bullets.",
    "Keep the full response under 100 words.",
    "",
    `PR Title: ${pr.title}`,
    "",
    "Code Diff:",
    diffText,
    "",
    "Documentation Content:",
    docs
      .map((doc) => `### ${doc.path}\n${doc.content}`)
      .join("\n\n"),
  ].join("\n");
}
