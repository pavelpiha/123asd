import { createAPIMessage } from "./get-ai-response.js";
export async function analyzePullRequest(styleGuide, PullRequestDetails) {
    const prompt = createBasePullRequestPrompt(styleGuide, PullRequestDetails);
    const aiResponse = await getAICommentResponse(prompt);
    console.log("analyze PR response: ", aiResponse);
    return aiResponse;
}
function createBasePullRequestPrompt(styleGuide, pullRequestDetails) {
    return `Your task is to check pull request follows style-guide. Instructions:
  - Provide the response in following JSON format: "<b><Style guide Title></b> \n <b><style_guide_section></b>\n  <i><violated_rule></i> <status> \n"
  - Example: "<Application name> Style guide: \n Section 1. \n Use camel case :x:\n"
  - Go through each rule strictly and carefully.
  - Provide a list of violated rules exactly as it appears in the Style Guide followed by the <status>. ':x:'- if rule is violated; ':thinking:' - if you are unsure
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
async function getAICommentResponse(prompt) {
    try {
        const result = await createAPIMessage([{ role: "user", content: prompt }]);
        if (result.content.length) {
            return result.content[0].text;
        }
        else {
            console.error("Error: In result content ", result.content);
            return null;
        }
    }
    catch (error) {
        console.error("Error:", error);
        return null;
    }
}
