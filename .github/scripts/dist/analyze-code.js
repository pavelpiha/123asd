import { readFileSync } from "fs";
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import parseDiff from "parse-diff";
import { minimatch } from "minimatch";
import Anthropic from "@anthropic-ai/sdk";

const TOKEN = process.env.GIT_PAT;
const octokit = new Octokit({ auth: TOKEN });
const client = new Anthropic();

const createAPIMessage = async (messages) => {
  return await client.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages,
  });
};

async function getPullRequestDetails() {
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
    base: prResponse.data.base,
  };
}

async function getDiff(owner, repo, pull_number) {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  });
  return response.data;
}

async function analyzeCode(parsedDiff, PullRequestDetails) {
  const comments = [];
  for (const file of parsedDiff) {
    if (file.to === "/dev/null") continue;
    for (const chunk of file.chunks) {
      const prompt = createPrompt(file, chunk, PullRequestDetails);
      //   const aiResponse = await getAIResponse(prompt);
      const aiResponse = [
        {
          lineNumber: 1,
          reviewComment: prompt,
        },
      ];
      if (aiResponse) {
        const newComments = createComment(file, chunk, aiResponse);
        if (newComments) {
          comments.push(...newComments);
        }
      }
    }
  }
  return comments;
}

function createPrompt(file, chunk, PullRequestDetails) {
  return `Your task is to compare pull requests. Instructions:
- Provide the response in following JSON format:  {"reviews": [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]}
- Do not give positive comments or compliments.
- Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
- Write the comment in GitHub Markdown format.
- Use the given description only for the overall context and only comment the code.
- IMPORTANT: NEVER suggest adding comments to the code.

Review the following code diff in the file "${file.to}" and take the pull request title and description into account when writing the response.

Pull request title: ${PullRequestDetails.title}
Pull request description:

---
${PullRequestDetails.description}
---

Git diff to review:

\`\`\`diff
${chunk.content}
${chunk.changes.map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`).join("\n")}
\`\`\`
`;
}

async function getAIResponse(prompt) {
  try {
    const result = await createAPIMessage([{ role: "user", content: prompt }]);
    if (result.content.length) {
      return JSON.parse(result.content[0].text).reviews;
    } else {
      console.error("Error: In result content ", result.content);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function createComment(file, chunk, aiResponses) {
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

async function createReviewComment(owner, repo, pull_number, comments) {
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    comments,
    event: "COMMENT",
  });
}

async function main() {
  const PullRequestDetails = await getPullRequestDetails();
  let diff;
  const eventData = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
  );
  if (eventData.action === "opened") {
    diff = await getDiff(
      PullRequestDetails.owner,
      PullRequestDetails.repo,
      PullRequestDetails.pull_number
    );
  } else if (eventData.action === "synchronize") {
    const newBaseSha = eventData.before;
    const newHeadSha = eventData.after;
    const response = await octokit.repos.compareCommits({
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
      owner: PullRequestDetails.owner,
      repo: PullRequestDetails.repo,
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
  const comments = await analyzeCode(filteredDiff, PullRequestDetails);
//   if (comments.length > 0) {
//     await createReviewComment(
//       PullRequestDetails.owner,
//       PullRequestDetails.repo,
//       PullRequestDetails.pull_number,
//       comments
//     );
//   }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
