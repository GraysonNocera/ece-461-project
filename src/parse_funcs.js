"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.gql_query = exports.fetchGithubAPI = exports.getGitRepoDetails = exports.npm_2_git = void 0;
var axios_1 = require("axios");
var isGitHubUrl = require("is-github-url");
var URL = require("url");
var fs = require("fs");
var MAX_RETRIES = 1;
///*
function npm_2_git(npmUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var packageName, retries, response, packageInfo, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // check if input is a valid URL
                    if (!URL.parse(npmUrl).hostname) {
                        throw new Error("Invalid NPM package URL: ".concat(npmUrl));
                    }
                    packageName = npmUrl.split("/").pop();
                    retries = 0;
                    _a.label = 1;
                case 1:
                    if (!(retries < MAX_RETRIES)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1["default"].get("https://registry.npmjs.org/".concat(packageName))];
                case 3:
                    response = _a.sent();
                    packageInfo = response.data;
                    // check if package have repository
                    if (!packageInfo.repository) {
                        throw new Error("No repository found for package: ".concat(packageName));
                    }
                    // check if repository is on github
                    if (isGitHubUrl(packageInfo.repository.url)) {
                        return [2 /*return*/, packageInfo.repository.url.replace("git+https", "git")];
                    }
                    else {
                        throw new Error("Repository of package: ".concat(packageName, " is not on GitHub"));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    if (error_1.response && error_1.response.status === 404) {
                        throw new Error("Package not found: ".concat(packageName));
                    }
                    else if (error_1.response && error_1.response.status === 429) {
                        throw new Error("Rate limit exceeded: ".concat(error_1.response.headers["Retry-After"], " seconds"));
                    }
                    else if (error_1.code === "ECONNREFUSED") {
                        console.log("Error: ".concat(error_1.code, ". Retrying..."));
                        retries++;
                        return [3 /*break*/, 1];
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 1];
                case 6: throw new Error("Error: Maximum retries exceeded for package: ".concat(packageName));
            }
        });
    });
}
exports.npm_2_git = npm_2_git;
function getGitRepoDetails(url) {
    return __awaiter(this, void 0, void 0, function () {
        var match, repoName, username;
        return __generator(this, function (_a) {
            //console.log (`\nParsing -> ${url}\n`)
            if (url.startsWith("git:")) {
                match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
            }
            else {
                match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
            }
            if (match) {
                repoName = match[2];
                username = match[1];
                //console.log (`getGitRepoDetails returns ${username}/${repoName}`);
                return [2 /*return*/, { username: username, repoName: repoName }];
            }
            console.error("getGitRepoDetails returns Null; Nothing matched\n");
            return [2 /*return*/, null];
        });
    });
}
exports.getGitRepoDetails = getGitRepoDetails;
function fetchGithubAPI(gql_query) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://api.github.com/graphql", {
                            method: "POST",
                            headers: {
                                "Authorization": "Token ".concat(process.env.GITHUB_TOKEN)
                            },
                            body: JSON.stringify({ query: gql_query })
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    console.log("\nData Acquired From API\n");
                    fs.promises.writeFile("API_RETURN.json", JSON.stringify(data, null, 4), function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("API Return Saved to File for further parsing!");
                        }
                    });
                    return [2 /*return*/, data];
                case 3:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.fetchGithubAPI = fetchGithubAPI;
function gql_query(username, repo) {
    return "\n    {\n      repository(owner: \"".concat(username, "\", name: \"").concat(repo, "\") {\n        name\n        forkCount\n        licenseInfo {\n          name\n        }\n        assignableUsers {\n          totalCount\n        }\n        sshUrl\n        latestRelease {\n          tagName\n        }\n        hasIssuesEnabled\n        issues {\n          totalCount\n        }\n        open_issues: issues(states: OPEN) {\n          totalCount\n        }\n        defaultBranchRef {\n          target {\n            ... on Commit {\n              history {\n                totalCount\n              }\n            }\n          }\n        }\n        pullRequests {\n          totalCount\n        }\n        \n        last_pushed_at: pushedAt\n        \n        stargazerCount\n        hasVulnerabilityAlertsEnabled\n      }\n      \n      securityVulnerabilities (first: 100) {\n        nodes {\n          firstPatchedVersion {\n            identifier\n          }\n          severity\n        }\n      }\n    }\n    ");
}
exports.gql_query = gql_query;
