import type { AppConfig } from "../config/env.js";
import { createIssueComment, updatePullRequestBody } from "../github/client.js";
import type { PullRequestContext } from "../github/pullRequest.js";
import {
  buildDocSyncComment,
  buildRiskComment,
  buildSummaryAppend,
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

  await createIssueComment(
    config,
    pullRequest,
    buildRiskComment(payload.riskAnalysis, payload.truncationNote),
  );

  if (payload.docSync) {
    await createIssueComment(
      config,
      pullRequest,
      buildDocSyncComment(payload.docSync, payload.truncationNote),
    );
  }
}
