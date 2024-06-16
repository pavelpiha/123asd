import { existsSync, readFileSync } from "fs";
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import parseDiff from "parse-diff";
import { minimatch } from "minimatch";
import Anthropic from "@anthropic-ai/sdk";
const TOKEN = process.env.GIT_PAT;
const PATH_TO_STYLE_GUIDE = "../../STYLE_GUIDELINES.md";
const octokit = new Octokit({ auth: TOKEN });
const client = new Anthropic();
async function createAPIMessage(messages) {
    return await client.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages,
    });
}
function readStyleGuide() {
    if (existsSync(PATH_TO_STYLE_GUIDE)) {
        try {
            return readFileSync(PATH_TO_STYLE_GUIDE, "utf8");
        }
        catch (error) {
            console.log("ERROR: Can not read Style guide file");
        }
    }
    else {
        console.log("ERROR: Style guide file not found");
        return "";
    }
}
async function getPullRequestDetails() {
    const { repository, number } = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8"));
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
async function getPullRequestCommitsNames() {
    const { repository, number } = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8"));
    const response = await octokit.pulls.listCommits({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: number,
    });
    return response.data.map((commit) => commit.commit.message);
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
        if (file.to === "/dev/null")
            continue;
        for (const chunk of file.chunks) {
            const prompt = createPrompt(file, chunk, PullRequestDetails);
        }
    }
    return comments;
}
function createPrompt(file, chunk, PullRequestDetails) {
    return "";
}
async function getAIResponse(prompt) {
    try {
        const result = await createAPIMessage([{ role: "user", content: prompt }]);
        if (result.content.length) {
            return JSON.parse(result.content[0].text).reviews;
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
    const styleGuide = readStyleGuide();
    if (!styleGuide) {
        console.log("ERROR: Style guide not found");
        return;
    }
    console.log("styleGuide", styleGuide);
    const pullRequestDetails = await getPullRequestDetails();
    const commits = await getPullRequestCommitsNames();
    pullRequestDetails.commitMessages = commits;
    console.log("-------------pullRequestDetails---------start------", pullRequestDetails);
    console.log("-------------pullRequestDetails---------end------");
    let diff;
    const eventData = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8"));
    if (eventData.action === "opened") {
        diff = await getDiff(pullRequestDetails.owner, pullRequestDetails.repo, pullRequestDetails.pull_number);
    }
    else if (eventData.action === "synchronize") {
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
    }
    else {
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
        return !excludePatterns.some((pattern) => minimatch(file.to ?? "", pattern));
    });
    const comments = await analyzeCode(filteredDiff, pullRequestDetails);
}
main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
