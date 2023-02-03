"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphAPIfetch = exports.getGitRepoDetails = exports.npm_2_git = exports.gql_query = void 0;
const axios_1 = __importDefault(require("axios"));
const URL = __importStar(require("url"));
let fs = require("fs");
const MAX_RETRIES = 1;
const isGitHubUrl = require("is-github-url");
function gql_query(username, repo) {
    return `
  {
    repository(owner: "${username}", name: "${repo}") {
      name
      forkCount
      licenseInfo {
        name
      }
      assignableUsers {
        totalCount
      }
      sshUrl
      latestRelease {
        tagName
      }
      hasIssuesEnabled
      issues {
        totalCount
      }
      open_issues: issues(states: OPEN) {
        totalCount
      }
      defaultBranchRef {
        target {
          ... on Commit {
            history {
              totalCount
            }
          }
        }
      }
      pullRequests {
        totalCount
      }
      
      last_pushed_at: pushedAt
      
      stargazerCount
      hasVulnerabilityAlertsEnabled
    }
    
    securityVulnerabilities (first: 100) {
      nodes {
        firstPatchedVersion {
          identifier
        }
        severity
      }
    }
  }
  `;
}
exports.gql_query = gql_query;
function npm_2_git(npmUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!URL.parse(npmUrl).hostname) {
            throw new Error(`Invalid NPM package URL: ${npmUrl}`);
        }
        const packageName = npmUrl.split("/").pop();
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                const response = yield axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
                const packageInfo = response.data;
                if (!packageInfo.repository) {
                    throw new Error(`No repository found for package: ${packageName}`);
                }
                if (isGitHubUrl(packageInfo.repository.url)) {
                    return packageInfo.repository.url.replace("git+https", "git");
                }
                else {
                    throw new Error(`Repository of package: ${packageName} is not on GitHub`);
                }
            }
            catch (error) {
                if (error.response && error.response.status === 404) {
                    throw new Error(`Package not found: ${packageName}`);
                }
                else if (error.response && error.response.status === 429) {
                    throw new Error(`Rate limit exceeded: ${error.response.headers["Retry-After"]} seconds`);
                }
                else if (error.code === "ECONNREFUSED") {
                    console.log(`Error: ${error.code}. Retrying...`);
                    retries++;
                    continue;
                }
                else {
                    throw error;
                }
            }
        }
        throw new Error(`Error: Maximum retries exceeded for package: ${packageName}`);
    });
}
exports.npm_2_git = npm_2_git;
function getGitRepoDetails(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let match;
        if (url.startsWith("git:")) {
            match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
        }
        else {
            match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
        }
        if (match) {
            let repoName = match[2];
            let username = match[1];
            return { username, repoName };
        }
        console.error(`getGitRepoDetails returns Null; Nothing matched\n`);
        return null;
    });
}
exports.getGitRepoDetails = getGitRepoDetails;
function graphAPIfetch(gql_query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("https://api.github.com/graphql", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${process.env.GITHUB_TOKEN}`
                },
                body: JSON.stringify({ query: gql_query })
            });
            const data = yield response.json();
            console.log("\nData Acquired From API\n");
            fs.writeFile("API_RETURN.json", JSON.stringify(data, null, 4), function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("API Return Saved to File for further parsing!");
                }
            });
            return data;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.graphAPIfetch = graphAPIfetch;
//# sourceMappingURL=parse_links.js.map