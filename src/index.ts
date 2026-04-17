import * as core from "@actions/core";

import { generateAnalysis } from "./ai/client.js";
import { loadConfig } from "./config/env.js";
import { readDocFiles } from "./docs/reader.js";
import { resolveDocsPaths } from "./docs/resolver.js";
import { fetchPullRequestContext } from "./github/client.js";
import { publishResults } from "./output/publisher.js";
import { limitDiff } from "./output/formatters.js";
import { buildDocSyncPrompt } from "./prompts/docSync.js";
import { buildPrSummaryPrompt } from "./prompts/prSummary.js";
import { buildRiskAnalysisPrompt } from "./prompts/riskAnalysis.js";
import { logger } from "./utils/logger.js";

async function run(): Promise<void> {
  const config = loadConfig();
  logger.info("Loaded action configuration", {
    model: config.aiModelName,
    docsPath: config.docsPath ?? null,
  });

  const pullRequest = await fetchPullRequestContext(config);
  logger.info("Fetched pull request context", {
    pullNumber: pullRequest.pullNumber,
    files: pullRequest.files.length,
    commits: pullRequest.commits.length,
  });

  const limitedDiff = limitDiff(pullRequest.diffText, config);
  const truncationNote = limitedDiff.truncated
    ? `_Note: ${limitedDiff.truncatedReason}_`
    : undefined;

  const summaryResponse = await generateAnalysis(config, {
    kind: "pr-summary",
    prompt: buildPrSummaryPrompt(pullRequest, limitedDiff.diffText),
  });

  const riskResponse = await generateAnalysis(config, {
    kind: "risk-analysis",
    prompt: buildRiskAnalysisPrompt(pullRequest, limitedDiff.diffText),
  });

  let docSyncText: string | undefined;
  const docPaths = await resolveDocsPaths(config.docsPath);
  if (config.docsPath && docPaths.length > 0) {
    const docs = await readDocFiles(docPaths);
    const docResponse = await generateAnalysis(config, {
      kind: "doc-sync",
      prompt: buildDocSyncPrompt(pullRequest, limitedDiff.diffText, docs),
    });
    docSyncText = docResponse.text;
  } else if (config.docsPath) {
    logger.warning("DOCS_PATH was provided but no matching files were found");
  }

  await publishResults(config, pullRequest, {
    summary: summaryResponse.text,
    riskAnalysis: riskResponse.text,
    docSync: docSyncText,
    truncationNote,
  });

  logger.info("Published PR-Insight results");
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error("Action failed", { message });
  core.setFailed(message);
});
