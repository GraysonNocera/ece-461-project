import axios, { AxiosResponse } from "axios";
// import isGitHubUrl = require("is-github-url");
import * as URL from "url";
import { Package } from './package_class';
let fs = require("fs");

const MAX_RETRIES = 1;
const isGitHubUrl = require("is-github-url");

// import { Octokit } from "octokit";
import { Octokit as OctokitType } from "octokit";
const Octokit = OctokitType as any;
import * as readline from 'readline';

// Set up authentication token
// To do this, I copied and pasted my github token into an environment variable
// in vs code and referenced it in this line
const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN,
  userAgent: "using apis",
  timeZone: "Eastern",
  baseUrl: 'https://api.github.com',
});

export function gql_query(username:string, repo:string) {
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


// Takes a NPM package URL and returns the GitHub URL
export async function npm_2_git(npmUrl: string): Promise<string> {
  
  // check if input is a valid URL
  if (!URL.parse(npmUrl).hostname) {
    throw new Error(`Invalid NPM package URL: ${npmUrl}`);
  }

  // extract the package name from the npm URL
  const packageName = npmUrl.split("/").pop();
  let retries = 0;
  
  while (retries < MAX_RETRIES) {

    try {
      // use the npm registry API to get the package information
      const response: AxiosResponse = await axios.get(
        `https://registry.npmjs.org/${packageName}`
      );
      const packageInfo = response.data;

      // check if package have repository
      if (!packageInfo.repository) {
        throw new Error(`No repository found for package: ${packageName}`);
      }

      // check if repository is on github
      if (isGitHubUrl(packageInfo.repository.url)) {
        return packageInfo.repository.url.replace("git+https", "git");
      } else {
        throw new Error(
          `Repository of package: ${packageName} is not on GitHub`
        );
      }


    } 
    
    catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Package not found: ${packageName}`);
      } else if (error.response && error.response.status === 429) {
        throw new Error(
          `Rate limit exceeded: ${error.response.headers["Retry-After"]} seconds`
        );
      } else if (error.code === "ECONNREFUSED") {
        console.log(`Error: ${error.code}. Retrying...`);
        retries++;
        continue;
      } else {
        throw error;
      }
    }
  }

  throw new Error(
    `Error: Maximum retries exceeded for package: ${packageName}`
  );
}


export async function getGitRepoDetails(url: string): Promise<{username: string, repoName: string} | null> {
  let match: RegExpMatchArray | null;
  //console.log (`\nParsing -> ${url}\n`)

  if (url.startsWith("git:")) {
      match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  } else {
      match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
  }
  if (match) {
      let repoName = match[2];
      let username = match[1];
      //console.log (`getGitRepoDetails returns ${username}/${repoName}`);
      return {username, repoName};
  }

  console.error (`getGitRepoDetails returns Null; Nothing matched\n`);
  return null;
}

export async function graphAPIfetch(gql_query: string, package_test: Package): Promise<any> {
    try {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.GITHUB_TOKEN}`
        },
        body: JSON.stringify({ query: gql_query })
      });

      const data = await response.json();
      
      console.log ("\nData Acquired From API\n")
      fs.writeFile("API_RETURN.json", JSON.stringify(data, null, 4), function (err: any) {
        if (err) {
          console.log(err);
        } else {
          console.log("API Return Saved to File for further parsing!");
        }
      });
      let data2 = JSON.stringify(data);
      let data3 = JSON.parse(data2);
      
      package_test.num_dev = data3.data.repository.assignableUsers.totalCount;
      package_test.issues_active = data3.data.repository.open_issues.totalCount;
      package_test.issues = data3.data.repository.issues.totalCount; 
      // console.log(data3.data.repository.name)

      return data;
    } catch (error) {
      console.error(error);
    }
}

export async function get_recentCommits(repo: string, owner: string): Promise<number> {

  let count = 0;
  let page = 1;
  let per_page = 30;
  let commitsRemaining = true;
  const recent = new Date();
  recent.setMonth(recent.getMonth() - 3);
  let sincedate = `${recent.getFullYear()}-${recent.getMonth()}-${recent.getDay()}`
  console.log(sincedate)

  try {
      while (commitsRemaining) {
          let result = await octokit.request(
              'GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,page,per_page}',
              {
                  owner: owner,
                  repo: repo,
                  since: sincedate,
                  page: page,
                  per_page: per_page
              }
          );

          count += result.data.length;

          if (result.data.length < per_page) {
              commitsRemaining = false;
          } else {
              page++;
          }
      }
  } catch (error) {
      console.error("Could not find repository commit counts.");
  }
  console.log(count)
  return count;
}

export async function get_workingLifetime(repo: string, owner: string): Promise<number> {
  let workingLifetime = 0;

  try {
      const result = await octokit.request('GET /repos/{owner}/{repo}',
      {
      owner: owner,
      repo: repo
      });
      const dateCreated = new Date(result.data.created_at);
      console.log(dateCreated)

      const latestCommit = await octokit.request('GET /repos/{owner}/{repo}/commits',
      {
      owner: owner,
      repo: repo,
      per_page: 1
      });
      const recCommit = new Date(latestCommit.data[0].commit.author.date);
      console.log(recCommit)

      workingLifetime = recCommit.getTime() - dateCreated.getTime();
  } catch (error) {
      console.error("This repo is ass.");
  }
  
  return workingLifetime;
}