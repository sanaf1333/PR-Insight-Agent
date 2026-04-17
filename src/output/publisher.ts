import type { AppConfig } from "../config/env.js";
import { updatePullRequestBody, upsertManagedIssueComment } from "../github/client.js";
import type { PullRequestContext } from "../github/pullRequest.js";
import {
  buildDocSyncComment,
  buildRiskComment,
  buildSummaryAppend,
  DOC_SYNC_COMMENT_MARKER,
  RISK_COMMENT_MARKER,
} from "./formatters.js";

export interface PublishPayload {
  summary: string;
  riskAnalysis: string;
  docSync?: string;
  truncationNote?: string;
}

export async function publishResults(
  config: AppConfig,
  pullRequest: PullRequestContext,
  payload: PublishPayload,
): Promise<void> {
  const nextBody = buildSummaryAppend(pullRequest.body, payload.summary);
  await updatePullRequestBody(config, pullRequest, nextBody);

  await upsertManagedIssueComment(
    config,
    pullRequest,
    RISK_COMMENT_MARKER,
    buildRiskComment(payload.riskAnalysis, payload.truncationNote),
    "## PR-Insight Risk Analysis",
  );

  if (payload.docSync) {
    await upsertManagedIssueComment(
      config,
      pullRequest,
      DOC_SYNC_COMMENT_MARKER,
      buildDocSyncComment(payload.docSync, payload.truncationNote),
      "## PR-Insight Documentation Sync",
    );
  }
}
