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
Object.defineProperty(exports, "__esModule", { value: true });
const url_class_1 = require("../src/url_class");
const fs = __importStar(require("fs"));
function getGitRepoDetails(url) {
    let match;
    if (url.startsWith("git://github.com/")) {
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
    return null;
}
function fetchGithubAPI(gql_query) {
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
const arg = process.argv.slice(2);
const { username, repoName } = getGitRepoDetails(arg[0]) || {};
var gql_query = `
{
    repository(owner: "${username}", name: "${repoName}") {
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
var data = fetchGithubAPI(gql_query);
var curr_package = new url_class_1.Runner("sshUrl", repoName, username);
//# sourceMappingURL=basic_skeleton.js.map