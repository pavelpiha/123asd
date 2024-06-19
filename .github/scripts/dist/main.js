import { readFileSync } from "fs";
import * as actionsCore from "@actions/core";
import { Octokit } from "@octokit/rest";
import parseDiff from "parse-diff";
import { minimatch } from "minimatch";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve, extname } from "path";
import { analyzePullRequest } from "./analyze-pull-request.js";
import { analyzeCode } from "./analyze-code.js";
const TOKEN = process.env.GIT_PAT;
const octokit = new Octokit({ auth: TOKEN });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isTypeScript = extname(__filename) === ".ts";
const PATH_TO_STYLE_GUIDE = isTypeScript
    ? "../../STYLE_GUIDELINES.md"
    : "../../../STYLE_GUIDELINES.md";
const filePath = resolve(__dirname, PATH_TO_STYLE_GUIDE);
async function readStyleGuide() {
    try {
        return await readFile(filePath, "utf8");
    }
    catch (err) {
        console.log("Error: reading the file:", err);
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
        targetBranch: prResponse.data.base.ref ?? "",
        sourceBranch: prResponse.data.head.ref ?? "",
        description: prResponse.data.body ?? "",
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
async function sendReviewComment(owner, repo, pull_number, comments) {
    await octokit.pulls.createReview({
        owner,
        repo,
        pull_number,
        comments,
        event: "COMMENT",
    });
}
async function sendComment(owner, repo, pull_number, comment) {
    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: comment,
    });
}
async function main() {
    const styleGuide = await readStyleGuide();
    if (!styleGuide) {
        console.log("ERROR: Style guide not found");
        return;
    }
    const pullRequestDetails = await getPullRequestDetails();
    const commits = await getPullRequestCommitsNames();
    pullRequestDetails.commitMessages = commits;
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
    const parsedDiff = parseDiff(diff);
    const excludePatterns = actionsCore
        .getInput("exclude")
        .split(",")
        .map((s) => s.trim());
    const filteredDiff = parsedDiff.filter((file) => {
        return !excludePatterns.some((pattern) => minimatch(file.to ?? "", pattern));
    });
    const comment = await analyzePullRequest(styleGuide, pullRequestDetails);
    const reviewComments = await analyzeCode(styleGuide, filteredDiff, pullRequestDetails);
    if (reviewComments.length > 0) {
        await sendReviewComment(pullRequestDetails.owner, pullRequestDetails.repo, pullRequestDetails.pull_number, reviewComments);
    }
    if (comment) {
        await sendComment(pullRequestDetails.owner, pullRequestDetails.repo, pullRequestDetails.pull_number, comment);
    }
}
main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
