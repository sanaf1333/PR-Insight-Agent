export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface PullRequestContext {
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
  body: string;
  htmlUrl: string;
  baseRef: string;
  headRef: string;
  commits: string[];
  files: PullRequestFile[];
  diffText: string;
}
