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
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_tcoverage = exports.get_lifetime = exports.get_commitcount = exports.get_issues = void 0;
const octokit_1 = require("octokit");
const Octokit = octokit_1.Octokit;
const octokit = new Octokit({
    auth: "string of tokens",
    userAgent: "using apis",
    timeZone: "Eastern",
    baseUrl: 'https://api.github.com',
});
function get_issues(repo, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        let issuecount = 0;
        let page = 1;
        let per_page = 30;
        let issuesRemaining = true;
        try {
            while (issuesRemaining) {
                let result = yield octokit.request('GET /repos/{owner}/{repo}/issues{?state,head,base,sort,direction,per_page,page}', {
                    owner: owner,
                    repo: repo,
                    state: "closed",
                    since: "1999-01-23",
                    per_page: per_page,
                    page: page
                });
                issuecount += result.data.length;
                if (result.data.length < per_page) {
                    issuesRemaining = false;
                }
                else {
                    page++;
                }
            }
        }
        catch (error) {
            console.error("Could not find number of issues in repository.");
        }
        return issuecount;
    });
}
exports.get_issues = get_issues;
function get_commitcount(repo, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 0;
        let page = 1;
        let per_page = 30;
        let commitsRemaining = true;
        try {
            while (commitsRemaining) {
                let result = yield octokit.request('GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,page,per_page}', {
                    owner: owner,
                    repo: repo,
                    page: page,
                    per_page: per_page
                });
                count += result.data.length;
                if (result.data.length < per_page) {
                    commitsRemaining = false;
                }
                else {
                    page++;
                }
            }
        }
        catch (error) {
            console.error("Could not find repository commit counts.");
        }
        return count;
    });
}
exports.get_commitcount = get_commitcount;
function get_lifetime(repo, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        let created = "";
        try {
            let result = yield octokit.request('GET /repos/{owner}/{repo}', {
                owner: owner,
                repo: repo
            });
            created = result.data.created_at;
        }
        catch (error) {
            console.error("Could not find repository lifetime.");
        }
        return created;
    });
}
exports.get_lifetime = get_lifetime;
function get_tcoverage(repo, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        let coverage = 0;
        try {
            console.log("Test coverage function has not been written yet.");
        }
        catch (error) {
            console.error("Could not find test coverage of the repository.");
        }
        return coverage;
    });
}
exports.get_tcoverage = get_tcoverage;
//# sourceMappingURL=correctness.js.map