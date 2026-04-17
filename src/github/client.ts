import { context, getOctokit } from "@actions/github";

import type { AppConfig } from "../config/env.js";
import { GitHubApiError } from "../utils/errors.js";
import type { PullRequestContext, PullRequestFile } from "./pullRequest.js";

function buildDiffText(files: PullRequestFile[]): string {
  return files
    .map((file) => {
      const header = `File: ${file.filename}\nStatus: ${file.status}\nChanges: +${file.additions} -${file.deletions}\n`;
      const patch = file.patch ? `${file.patch}\n` : "Patch unavailable for this file.\n";
      return `${header}${patch}`;
    })
    .join("\n---\n");
}

export async function fetchPullRequestContext(
  config: AppConfig,
): Promise<PullRequestContext> {
  const payloadPullRequest = context.payload.pull_request;
  if (!payloadPullRequest) {
    throw new GitHubApiError("This action must run on a pull_request event");
  }

  const { owner, repo } = context.repo;
  const pullNumber = payloadPullRequest.number;
  const octokit = getOctokit(config.githubToken);

  try {
    const [pullResponse, filesResponse, commitsResponse] = await Promise.all([
      octokit.rest.pulls.get({ owner, repo, pull_number: pullNumber }),
      octokit.paginate(octokit.rest.pulls.listFiles, {
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      }),
      octokit.paginate(octokit.rest.pulls.listCommits, {
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      }),
    ]);

    const files: PullRequestFile[] = filesResponse.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch ?? undefined,
    }));

    return {
      owner,
      repo,
      pullNumber,
      title: pullResponse.data.title,
      body: pullResponse.data.body ?? "",
      htmlUrl: pullResponse.data.html_url,
      baseRef: pullResponse.data.base.ref,
      headRef: pullResponse.data.head.ref,
      commits: commitsResponse.map((commit) => commit.commit.message),
      files,
      diffText: buildDiffText(files),
    };
  } catch (error) {
    throw new GitHubApiError("Failed to fetch pull request context", error);
  }
}

export async function updatePullRequestBody(
  config: AppConfig,
  pullRequest: PullRequestContext,
  body: string,
): Promise<void> {
  const octokit = getOctokit(config.githubToken);
  await octokit.rest.pulls.update({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.pullNumber,
    body,
  });
}

export async function createIssueComment(
  config: AppConfig,
  pullRequest: PullRequestContext,
  body: string,
): Promise<void> {
  const octokit = getOctokit(config.githubToken);
  await octokit.rest.issues.createComment({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    issue_number: pullRequest.pullNumber,
    body,
  });
}

export async function upsertManagedIssueComment(
  config: AppConfig,
  pullRequest: PullRequestContext,
  marker: string,
  body: string,
  fallbackHeading?: string,
): Promise<void> {
  const octokit = getOctokit(config.githubToken);
  const comments = await octokit.paginate(octokit.rest.issues.listComments, {
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    issue_number: pullRequest.pullNumber,
    per_page: 100,
  });

  const existingComment = comments.find(
    (comment) =>
      comment.body?.includes(marker) ||
      (fallbackHeading ? comment.body?.includes(fallbackHeading) : false),
  );

  if (existingComment) {
    await octokit.rest.issues.updateComment({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      comment_id: existingComment.id,
      body,
    });
    return;
  }

  await createIssueComment(config, pullRequest, body);
}
