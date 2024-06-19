import { File } from "parse-diff";
import { PullRequestDetails, ReviewComment } from "./models";
import { createAPIMessage } from "./get-ai-response.js";
import { TextBlock } from "@anthropic-ai/sdk/resources/messages.js";

export async function analyzeCode(
  styleGuide: string,
  parsedDiff: File[],
  pullRequestDetails: PullRequestDetails
): Promise<ReviewComment[]> {
  const reviewComments: Array<ReviewComment> = [];

  for (const file of parsedDiff) {
    if (file.to === "/dev/null") continue; // Ignore deleted files
    const prompt = createPrompt(styleGuide, file, pullRequestDetails);
    const aiResponse = await getAIResponse(prompt);
    const codeComments = aiResponse.filter((item) => item.lineNumber !== "0");
    if (codeComments.length) {
      const newComments = createReviewComment(file, codeComments);
      if (newComments) {
        reviewComments.push(...newComments);
      }
    }
  }

  return reviewComments;
}

function createReviewComment(
  file: File,
  aiResponses: Array<{
    lineNumber: string;
    reviewComment: string;
  }>
): Array<ReviewComment> {
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

function createPrompt(
  styleGuide: string,
  file: File,
  pullRequestDetails: PullRequestDetails
): string {
  const chunkString = file.chunks.map((chunk) => {
    return `\`\`\`diff
      ${chunk.content}
      ${chunk.changes
        .map((change) => {
          if (change.type === "add" || change.type === "del") {
            return `${change.ln} ${change.content}`;
          } else {
            return ` ${change.ln2} ${change.content}`;
          }
        })
        .join("\n")}
      \`\`\``;
  });
  return `Your task is to check pull request follows style-guide. Instructions:
  - Provide the response in following JSON format:  {"reviews": [{"lineNumber":  <line_number>, "reviewComment": "Style guide: <violated_rule_with_status>"}]}
  - Go through each rule strictly and carefully.
  - Provide a list of violated rules as a bullet point exactly as it appears in the Style Guide, followed by the status 'false' if it is violated or 'true' if it is not violated or  'not sure' if you are unsure
  - Be especially careful when checking the branch and commit rules, as you have made mistakes in this area before.
  - IMPORTANT: NEVER provide any explanations or code in your response.

  Style guide:
  <style-guide>
  ${styleGuide}
  </style-guide>

  Pull request details:
  Pull request title: ${pullRequestDetails.title}
  Source branch: ${pullRequestDetails.sourceBranch}
  Target branch: ${pullRequestDetails.targetBranch}
  Commit message: ${pullRequestDetails.commitMessages}
  File path and name : ${file.to}

  Git diff to review:

  ${chunkString.join("\n")}
  `;
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
