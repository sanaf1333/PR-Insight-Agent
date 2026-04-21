export function buildDocSyncPrompt(pr, diffText, docs) {
    return [
        "Compare the pull request changes with the provided documentation and return only actionable documentation guidance.",
        "Do not summarize the PR, do not explain what files were reviewed, and do not restate implementation details.",
        "Suggest changes only for documentation files that already exist in the provided documentation content.",
        "Never propose edits to source files, test files, workflow files, or any path outside the provided documentation set.",
        "If the docs already match the code changes, respond with exactly: No documentation changes suggested.",
        "If the changed documentation in this PR already covers the behavior changes, respond with exactly: No documentation changes suggested.",
        "Do not suggest updating changelogs or build logs unless they are clearly inaccurate or missing a documented decision from this PR.",
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
