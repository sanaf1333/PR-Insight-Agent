import type { DocFile } from "../docs/reader.js";
import type { PullRequestContext } from "../github/pullRequest.js";

export function buildDocSyncPrompt(
  pr: PullRequestContext,
  diffText: string,
  docs: DocFile[],
): string {
  return [
    "Compare the pull request changes with the provided documentation and return concise markdown.",
    "Return these sections:",
    "## Documentation Status",
    "## Files Reviewed",
    "## Suggested Updates",
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
