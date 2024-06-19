/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => {
  // webpackBootstrap
  /******/ "use strict";
  /******/ var __webpack_modules__ = {
    /***/ "./analyze-code.ts":
      /*!*************************!*\
  !*** ./analyze-code.ts ***!
  \*************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        eval(
          '__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   analyzeCode: () => (/* binding */ analyzeCode)\n/* harmony export */ });\nasync function analyzeCode(styleGuide, parsedDiff, pullRequestDetails) {\n    const reviewComments = [];\n    for (const file of parsedDiff) {\n        if (file.to === "/dev/null")\n            continue;\n        const prompt = createPrompt(styleGuide, file, pullRequestDetails);\n        const aiResponse = [\n            {\n                lineNumber: "1",\n                reviewComment: "properties in @Component decorator should be sorted by next order: - false",\n            },\n            {\n                lineNumber: "0",\n                reviewComment: "basic rule violation: - false",\n            },\n        ];\n        const codeComments = aiResponse.filter((item) => item.lineNumber !== "0");\n        if (codeComments.length) {\n            const newComments = createReviewComment(file, codeComments);\n            if (newComments) {\n                reviewComments.push(...newComments);\n            }\n        }\n    }\n    return reviewComments;\n}\nfunction createReviewComment(file, aiResponses) {\n    return aiResponses.flatMap((aiResponse) => {\n        if (!file.to) {\n            return [];\n        }\n        return {\n            body: aiResponse.reviewComment,\n            path: file.to,\n            line: Number(aiResponse.lineNumber),\n        };\n    });\n}\nfunction createPrompt(styleGuide, file, pullRequestDetails) {\n    const chunkString = file.chunks.map((chunk) => {\n        return `\\`\\`\\`diff\r\n      ${chunk.content}\r\n      ${chunk.changes\n            .map((change) => {\n            if (change.type === "add" || change.type === "del") {\n                return `${change.ln} ${change.content}`;\n            }\n            else {\n                return ` ${change.ln2} ${change.content}`;\n            }\n        })\n            .join("\\n")}\r\n      \\`\\`\\``;\n    });\n    return `Your task is to check pull request follows style-guide. Instructions:\r\n  - Provide the response in following JSON format:  {"reviews": [{"lineNumber":  <line_number>, "reviewComment": "Style guide: <violated_rule_with_status>"}]}\r\n  - Go through each rule strictly and carefully.\r\n  - Provide a list of violated rules as a bullet point exactly as it appears in the Style Guide, followed by the status \'false\' if it is violated or \'true\' if it is not violated or  \'not sure\' if you are unsure\r\n  - Be especially careful when checking the branch and commit rules, as you have made mistakes in this area before.\r\n  - IMPORTANT: NEVER provide any explanations or code in your response.\r\n\r\n  Style guide:\r\n  <style-guide>\r\n  ${styleGuide}\r\n  </style-guide>\r\n\r\n  Pull request details:\r\n  Pull request title: ${pullRequestDetails.title}\r\n  Source branch: ${pullRequestDetails.sourceBranch}\r\n  Target branch: ${pullRequestDetails.targetBranch}\r\n  Commit message: ${pullRequestDetails.commitMessages}\r\n  File path and name : ${file.to}\r\n\r\n  Git diff to review:\r\n\r\n  ${chunkString.join("\\n")}\r\n  `;\n}\n\n\n//# sourceURL=webpack://scripts/./analyze-code.ts?'
        );

        /***/
      },

    /***/ "./analyze-pull-request.ts":
      /*!*********************************!*\
  !*** ./analyze-pull-request.ts ***!
  \*********************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        eval(
          "__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   analyzePullRequest: () => (/* binding */ analyzePullRequest),\n/* harmony export */   createBasePullRequestPrompt: () => (/* binding */ createBasePullRequestPrompt)\n/* harmony export */ });\nasync function analyzePullRequest(styleGuide, PullRequestDetails) {\n    const prompt = createBasePullRequestPrompt(styleGuide, PullRequestDetails);\n    const aiResponse = \"\";\n    return aiResponse;\n}\nfunction createBasePullRequestPrompt(styleGuide, pullRequestDetails) {\n    return `Your task is to check pull request follows style-guide. Instructions:\r\n  - Provide the response in following JSON format:  \"Style guide: <violated_rule_with_status> new line for each rule.\"\r\n  - Go through each rule strictly and carefully.\r\n  - Provide a list of violated rules as a bullet point exactly as it appears in the Style Guide, followed by the status 'false' if it is violated or 'true' if it is not violated or  'not sure' if you are unsure\r\n  - Be especially careful when checking the branch and commit rules, as you have made mistakes in this area before.\r\n  - IMPORTANT: NEVER provide any explanations or code in your response.\r\n\r\n  Style guide:\r\n  <style-guide>\r\n  ${styleGuide}\r\n  </style-guide>\r\n\r\n  Pull request details:\r\n  Pull request title: ${pullRequestDetails.title}\r\n  Source branch: ${pullRequestDetails.sourceBranch}\r\n  Target branch: ${pullRequestDetails.targetBranch}\r\n  Commit message: ${pullRequestDetails.commitMessages}\r\n  Pull request description: ${pullRequestDetails.description}\r\n  `;\n}\n\n\n//# sourceURL=webpack://scripts/./analyze-pull-request.ts?"
        );

        /***/
      },

    /***/ "./main.ts":
      /*!*****************!*\
  !*** ./main.ts ***!
  \*****************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        eval(
          '__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @actions/core */ "@actions/core");\n/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _octokit_rest__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @octokit/rest */ "@octokit/rest");\n/* harmony import */ var _octokit_rest__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_octokit_rest__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var parse_diff__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! parse-diff */ "parse-diff");\n/* harmony import */ var parse_diff__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(parse_diff__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! minimatch */ "minimatch");\n/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(minimatch__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! fs/promises */ "fs/promises");\n/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(fs_promises__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! url */ "url");\n/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! path */ "path");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _analyze_pull_request__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./analyze-pull-request */ "./analyze-pull-request.ts");\n/* harmony import */ var _analyze_code__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./analyze-code */ "./analyze-code.ts");\n\n\n\n\n\n\n\n\n\n\nconst TOKEN = process.env.GIT_PAT;\nconst PATH_TO_STYLE_GUIDE = "../../STYLE_GUIDELINES.md";\nconst octokit = new _octokit_rest__WEBPACK_IMPORTED_MODULE_2__.Octokit({ auth: TOKEN });\nconst __filename = (0,url__WEBPACK_IMPORTED_MODULE_6__.fileURLToPath)("file:///D:/courses/github-actions/style-guide-ai-check/.github/scripts/main.ts");\nconst __dirname = (0,path__WEBPACK_IMPORTED_MODULE_7__.dirname)(__filename);\nconst filePath = (0,path__WEBPACK_IMPORTED_MODULE_7__.resolve)(__dirname, PATH_TO_STYLE_GUIDE);\nasync function readStyleGuide() {\n    try {\n        return await (0,fs_promises__WEBPACK_IMPORTED_MODULE_5__.readFile)(filePath, "utf8");\n    }\n    catch (err) {\n        console.log("Error: reading the file:", err);\n    }\n}\nasync function getPullRequestDetails() {\n    const { repository, number } = JSON.parse((0,fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(process.env.GITHUB_EVENT_PATH || "", "utf8"));\n    const prResponse = await octokit.pulls.get({\n        owner: repository.owner.login,\n        repo: repository.name,\n        pull_number: number,\n    });\n    return {\n        owner: repository.owner.login,\n        repo: repository.name,\n        pull_number: number,\n        title: prResponse.data.title ?? "",\n        targetBranch: prResponse.data.base.ref ?? "",\n        sourceBranch: prResponse.data.head.ref ?? "",\n        description: prResponse.data.body ?? "",\n        commitMessages: [],\n    };\n}\nasync function getPullRequestCommitsNames() {\n    const { repository, number } = JSON.parse((0,fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(process.env.GITHUB_EVENT_PATH || "", "utf8"));\n    const response = await octokit.pulls.listCommits({\n        owner: repository.owner.login,\n        repo: repository.name,\n        pull_number: number,\n    });\n    return response.data.map((commit) => commit.commit.message);\n}\nasync function getDiff(owner, repo, pull_number) {\n    const response = await octokit.pulls.get({\n        owner,\n        repo,\n        pull_number,\n        mediaType: { format: "diff" },\n    });\n    return response.data;\n}\nasync function sendReviewComment(owner, repo, pull_number, comments) {\n    await octokit.pulls.createReview({\n        owner,\n        repo,\n        pull_number,\n        comments,\n        event: "COMMENT",\n    });\n}\nasync function sendComment(owner, repo, pull_number, comment) {\n    await octokit.rest.issues.createComment({\n        owner,\n        repo,\n        issue_number: pull_number,\n        body: comment,\n    });\n}\nasync function main() {\n    const styleGuide = await readStyleGuide();\n    if (!styleGuide) {\n        console.log("ERROR: Style guide not found");\n        return;\n    }\n    const pullRequestDetails = await getPullRequestDetails();\n    const commits = await getPullRequestCommitsNames();\n    pullRequestDetails.commitMessages = commits;\n    let diff;\n    const eventData = JSON.parse((0,fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(process.env.GITHUB_EVENT_PATH ?? "", "utf8"));\n    if (eventData.action === "opened") {\n        diff = await getDiff(pullRequestDetails.owner, pullRequestDetails.repo, pullRequestDetails.pull_number);\n    }\n    else if (eventData.action === "synchronize") {\n        const newBaseSha = eventData.before;\n        const newHeadSha = eventData.after;\n        const response = await octokit.repos.compareCommits({\n            headers: {\n                accept: "application/vnd.github.v3.diff",\n            },\n            owner: pullRequestDetails.owner,\n            repo: pullRequestDetails.repo,\n            base: newBaseSha,\n            head: newHeadSha,\n        });\n        diff = String(response.data);\n    }\n    else {\n        console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);\n        return;\n    }\n    if (!diff) {\n        console.log("No diff found");\n        return;\n    }\n    const parsedDiff = parse_diff__WEBPACK_IMPORTED_MODULE_3___default()(diff);\n    const excludePatterns = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput("exclude")\n        .split(",")\n        .map((s) => s.trim());\n    const filteredDiff = parsedDiff.filter((file) => {\n        return !excludePatterns.some((pattern) => (0,minimatch__WEBPACK_IMPORTED_MODULE_4__.minimatch)(file.to ?? "", pattern));\n    });\n    const comment = await (0,_analyze_pull_request__WEBPACK_IMPORTED_MODULE_8__.analyzePullRequest)(styleGuide, pullRequestDetails);\n    const reviewComments = await (0,_analyze_code__WEBPACK_IMPORTED_MODULE_9__.analyzeCode)(styleGuide, filteredDiff, pullRequestDetails);\n    if (reviewComments.length > 0) {\n        await sendReviewComment(pullRequestDetails.owner, pullRequestDetails.repo, pullRequestDetails.pull_number, reviewComments);\n    }\n    if (comment) {\n        await sendComment(pullRequestDetails.owner, pullRequestDetails.repo, pullRequestDetails.pull_number, comment);\n    }\n}\nmain().catch((error) => {\n    console.error("Error:", error);\n    process.exit(1);\n});\n\n\n//# sourceURL=webpack://scripts/./main.ts?'
        );

        /***/
      },

    /***/ "@actions/core":
      /*!********************************!*\
  !*** external "@actions/core" ***!
  \********************************/
      /***/ (module) => {
        module.exports = require("@actions/core");

        /***/
      },

    /***/ "@octokit/rest":
      /*!********************************!*\
  !*** external "@octokit/rest" ***!
  \********************************/
      /***/ (module) => {
        module.exports = require("@octokit/rest");

        /***/
      },

    /***/ minimatch:
      /*!****************************!*\
  !*** external "minimatch" ***!
  \****************************/
      /***/ (module) => {
        module.exports = require("minimatch");

        /***/
      },

    /***/ "parse-diff":
      /*!*****************************!*\
  !*** external "parse-diff" ***!
  \*****************************/
      /***/ (module) => {
        module.exports = require("parse-diff");

        /***/
      },

    /***/ fs:
      /*!*********************!*\
  !*** external "fs" ***!
  \*********************/
      /***/ (module) => {
        module.exports = require("fs");

        /***/
      },

    /***/ "fs/promises":
      /*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
      /***/ (module) => {
        module.exports = require("fs/promises");

        /***/
      },

    /***/ path:
      /*!***********************!*\
  !*** external "path" ***!
  \***********************/
      /***/ (module) => {
        module.exports = require("path");

        /***/
      },

    /***/ url:
      /*!**********************!*\
  !*** external "url" ***!
  \**********************/
      /***/ (module) => {
        module.exports = require("url");

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__
    );
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/compat get default export */
  /******/ (() => {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = (module) => {
      /******/ var getter =
        module && module.__esModule
          ? /******/ () => module["default"]
          : /******/ () => module;
      /******/ __webpack_require__.d(getter, { a: getter });
      /******/ return getter;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module",
        });
        /******/
      }
      /******/ Object.defineProperty(exports, "__esModule", { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module can't be inlined because the eval devtool is used.
  /******/ var __webpack_exports__ = __webpack_require__("./main.ts");
  /******/
  /******/
})();
