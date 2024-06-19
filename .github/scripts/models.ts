export interface PullRequestDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  description: string;
  commitMessages: string[];
}

export interface ReviewComment {
  body: string;
  path: string;
  line: number;
}
