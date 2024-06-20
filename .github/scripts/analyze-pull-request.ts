import { PullRequestDetails } from "models";
import { createAPIMessage } from "./get-ai-response.js";
import { TextBlock } from "@anthropic-ai/sdk/resources/messages.js";

export async function analyzePullRequest(
  styleGuide: string,
  PullRequestDetails: PullRequestDetails
): Promise<string> {
  const prompt = createBasePullRequestPrompt(styleGuide, PullRequestDetails);
  const aiResponse = await getAICommentResponse(prompt);
  console.log("analyze PR response: ", aiResponse);
  return aiResponse;
}

function createBasePullRequestPrompt(
  styleGuide: string,
  pullRequestDetails: PullRequestDetails
): string {
  return `Your task is to check pull request follows style-guide. Instructions:
  - Provide the response in following JSON format: "Style guide: <new line> <violated_rule> <status> new line for each rule."
  - Example: "Style guide: <new line> <rule_name> <status> <new line> <rule_name> <status>"
  - Go through each rule strictly and carefully.
  - Provide a list of violated rules as a bullet point Exactly as it appears in the Style Guide (not only the number or rule but the name as well) followed by the <status>. ':x:'- if it is violated; ':white_check_mark:' - if it is not violated; ':confused:' - if you are unsure
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
  Pull request description: ${pullRequestDetails.description}
  `;
}

async function getAICommentResponse(prompt: string): Promise<string | null> {
  try {
    const result = await createAPIMessage([{ role: "user", content: prompt }]);
    if (result.content.length) {
      return (result.content[0] as TextBlock).text;
    } else {
      console.error("Error: In result content ", result.content);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
