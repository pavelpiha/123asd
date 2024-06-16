import { existsSync, readFileSync } from "fs";
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import parseDiff, { Chunk, File } from "parse-diff";
import { minimatch } from "minimatch";
import Anthropic from "@anthropic-ai/sdk";
import { Message, MessageParam, TextBlock } from "@anthropic-ai/sdk/resources";
import { APIPromise } from "@anthropic-ai/sdk/core";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

interface PullRequestDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  commitMessages: string[];
}

const TOKEN = process.env.GIT_PAT;
const PATH_TO_STYLE_GUIDE = "../../STYLE_GUIDELINES.md";
const octokit = new Octokit({ auth: TOKEN });
const client = new Anthropic();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = resolve(__dirname, PATH_TO_STYLE_GUIDE);

async function createAPIMessage(messages: MessageParam[]): Promise<Message> {
  return await client.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages,
  });
}

async function readStyleGuide() {
  try {
    return await readFile(filePath, "utf8");
  } catch (err) {
    console.error("Error reading the file:", err);
  }
}

async function getPullRequestDetails(): Promise<PullRequestDetails> {
  const { repository, number } = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
  );
  const prResponse = await octokit.pulls.get({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
  });
  return {
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
    title: prResponse.data.title ?? "",
    description: prResponse.data.body ?? "",
    targetBranch: prResponse.data.base.ref ?? "",
    sourceBranch: prResponse.data.head.ref ?? "",
    commitMessages: [],
  };
}
async function getPullRequestCommitsNames(): Promise<string[]> {
  const { repository, number } = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
  );
  const response = await octokit.pulls.listCommits({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
  });

  return response.data.map((commit) => commit.commit.message);
}

async function getDiff(
  owner: string,
  repo: string,
  pull_number: number
): Promise<any | null> {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  });
  return response.data;
}

async function analyzeCode(
  parsedDiff: File[],
  PullRequestDetails: PullRequestDetails
): Promise<Array<{ body: string; path: string; line: number }>> {
  const comments: Array<{ body: string; path: string; line: number }> = [];

  for (const file of parsedDiff) {
    if (file.to === "/dev/null") continue; // Ignore deleted files
    for (const chunk of file.chunks) {
      const prompt = createPrompt(file, chunk, PullRequestDetails);
      // const aiResponse = await getAIResponse(prompt);
      // if (aiResponse) {
      //   const newComments = createComment(file, chunk, aiResponse);
      //   if (newComments) {
      //     comments.push(...newComments);
      //   }
      // }
    }
  }
  return comments;
}

function createPrompt(
  file: File,
  chunk: Chunk,
  PullRequestDetails: PullRequestDetails
): string {
  return "";
}

async function getAIResponse(prompt: string): Promise<Array<{
  lineNumber: string;
  reviewComment: string;
}> | null> {
  try {
    const result = await createAPIMessage([{ role: "user", content: prompt }]);
    if (result.content.length) {
      return JSON.parse((result.content[0] as TextBlock).text).reviews;
    } else {
      console.error("Error: In result content ", result.content);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function createComment(
  file: File,
  chunk: Chunk,
  aiResponses: Array<{
    lineNumber: string;
    reviewComment: string;
  }>
): Array<{ body: string; path: string; line: number }> {
  return aiResponses.flatMap((aiResponse) => {
    if (!file.to) {
      return [];
    }
    return {
      body: aiResponse.reviewComment,
      path: file.to,
      line: Number(aiResponse.lineNumber),
    };
  });
}

async function createReviewComment(
  owner: string,
  repo: string,
  pull_number: number,
  comments: Array<{ body: string; path: string; line: number }>
): Promise<void> {
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    comments,
    event: "COMMENT",
  });
}

async function main() {
  const styleGuide = await readStyleGuide();
  if (!styleGuide) {
    console.log("ERROR: Style guide not found");
    return;
  }
  console.log("styleGuide", styleGuide);
  const pullRequestDetails = await getPullRequestDetails();
  const commits = await getPullRequestCommitsNames();
  pullRequestDetails.commitMessages = commits;
  console.log(
    "-------------pullRequestDetails---------start------",
    pullRequestDetails
  );
  console.log("-------------pullRequestDetails---------end------");
  let diff: string | null;
  const eventData = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
  );

  if (eventData.action === "opened") {
    diff = await getDiff(
      pullRequestDetails.owner,
      pullRequestDetails.repo,
      pullRequestDetails.pull_number
    );
  } else if (eventData.action === "synchronize") {
    const newBaseSha = eventData.before;
    const newHeadSha = eventData.after;

    const response = await octokit.repos.compareCommits({
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
      owner: pullRequestDetails.owner,
      repo: pullRequestDetails.repo,
      base: newBaseSha,
      head: newHeadSha,
    });

    diff = String(response.data);
  } else {
    console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
    return;
  }

  if (!diff) {
    console.log("No diff found");
    return;
  }
  console.log("diff", diff);

  const parsedDiff = parseDiff(diff);

  const excludePatterns = core
    .getInput("exclude")
    .split(",")
    .map((s) => s.trim());

  const filteredDiff = parsedDiff.filter((file) => {
    return !excludePatterns.some((pattern) =>
      minimatch(file.to ?? "", pattern)
    );
  });

  const comments = await analyzeCode(filteredDiff, pullRequestDetails);
  // if (comments.length > 0) {
  //   await createReviewComment(
  //     pullRequestDetails.owner,
  //     pullRequestDetails.repo,
  //     pullRequestDetails.pull_number,
  //     comments
  //   );
  // }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
