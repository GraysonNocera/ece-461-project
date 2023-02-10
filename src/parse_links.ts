import axios, { AxiosResponse } from "axios";
import { Package } from "./package_class";
let fs = require("fs");
const MAX_RETRIES = 1;
const isGitHubUrl = require("is-github-url");
import { Octokit as OctokitType } from "octokit";
const Octokit = OctokitType as any;
import { provider } from "./logging";
import { Logger } from "typescript-logging-log4ts-style";

// GraphQL query to get the number of commits in the last year

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "using apis",
  timeZone: "Eastern",
  baseUrl: "https://api.github.com",
});

export function gql_query(username: string, repo: string) {
  // Function description
  // param: username:
  // param: repo:
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
  // Function description
  // param: npmUrl:
  // return: string: rest api gets total commits from the repository

  // check if input is a valid URL
  // if (!URL.parse(npmUrl).hostname) {
  //   throw new Error(`Invalid NPM package URL: ${npmUrl}`);
  // }

  let log: Logger = provider.getLogger("URLParsing.npm_2_git");

  // extract the package name from the npm URL
  const packageName = npmUrl.split("/").pop();
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      log.info("Using npm registroy API to fetch package info...");

      // use the npm registry API to get the package information
      const response: AxiosResponse = await axios.get(
        `https://registry.npmjs.org/${packageName}`
      );
      const packageInfo = response.data;

      // check if package have repository
      if (!packageInfo.repository) {
        log.debug("No repository found for package: " + packageName);
      }

      // check if repository is on github
      if (isGitHubUrl(packageInfo.repository.url)) {
        return packageInfo.repository.url.replace("git+https", "git");
      } else {
        log.debug(`Repository of package: ${packageName} is not on GitHub`);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        log.debug(`Package not found: ${packageName}`);
      } else if (error.response && error.response.status === 429) {
        log.debug(
          `Rate limit exceeded: ${error.response.headers["Retry-After"]} seconds`
        );
      } else if (error.code === "ECONNREFUSED") {
        log.debug(`Error: ${error.code}. Retrying...`);
        retries++;
        continue;
      } else {
        throw error;
      }
    }
  }

  log.debug(`Error: Maximum retries exceeded for package: ${packageName}`);
  throw new Error(
    `Error: Maximum retries exceeded for package: ${packageName}`
  );
}

export async function getGitRepoDetails(
  url: string
): Promise<{ username: string; repoName: string } | null> {
  // Function description
  // param: username:
  // param: repoName:
  // return: null

  let log: Logger = provider.getLogger("URLParse.getGitRepoDetails");

  let match: RegExpMatchArray | null;

  if (url.startsWith("git:")) {
    match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  } else {
    match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
  }
  if (match) {
    let repoName = match[2];
    let username = match[1];
    log.info(`Found username: ${username}, repoName: ${repoName}`);
    return { username, repoName };
  }

  log.debug(`getGitRepoDetails returns Null; Nothing matched\n`);
  return null;
}

export async function graphAPIfetch(
  gql_query: string,
  package_test: Package
): Promise<any> {
  // Function description
  // param: gql_query:
  // param: package_test:
  // return: any:

  let log: Logger = provider.getLogger("GraphQL.graphAPIfetch");

  try {
    log.info("Beginning GraphQL...");
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query: gql_query }),
    });

    const data = await response.json();

    log.info("Data acquired from API. Parsing data...");

    //redundancy is only redundancy if its redundant
    let data2 = JSON.stringify(data);
    let data3 = JSON.parse(data2);

    package_test.num_dev = data3.data.repository.assignableUsers.totalCount;

    // Check if the repo has issues enabled
    if (data3.data.repository.hasIssuesEnabled == true) {
      // If so, get the number of open issues
      package_test.issues_active = data3.data.repository.open_issues.totalCount;
      package_test.issues = data3.data.repository.issues.totalCount;
    } else {
      // If not, set the number of open issues to -1
      package_test.issues_active = -1;
      package_test.issues = -1;
    }

    package_test.total_commits =
      data3.data.repository.defaultBranchRef.target.history.totalCount;
    package_test.pr_count = data3.data.repository.pullRequests.totalCount;
    package_test.last_pushed_at = data3.data.repository.last_pushed_at;
    package_test.num_stars = data3.data.repository.stargazerCount;
    if (data3.data.repository.licenseInfo != null) {
      package_test.license_name = data3.data.repository.licenseInfo.name;
    } else {
      package_test.license_name = "no name";
    }

    return data;
  } catch (error) {
    log.debug("Error in GraphQL fetch: " + error);
  }
}

export async function get_recentCommits(
  repo: string,
  owner: string
): Promise<number> {
  // Get the number of commits within the last 3 months
  // param: repo: name of repository
  // param: owner: name of owner of repository
  // return: number: number of recent commits

  let log: Logger = provider.getLogger("Parsed.get_recent_commits");

  let count = 0;
  let page = 1;
  let per_page = 30;
  let commitsRemaining = true;
  const recent = new Date();
  recent.setMonth(recent.getMonth() - 3);
  let sincedate = `${recent.getFullYear()}-${recent.getMonth()}-${recent.getDay()}`;

  try {
    while (commitsRemaining) {
      let result = await octokit.request(
        "GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,page,per_page}",
        {
          owner: owner,
          repo: repo,
          since: sincedate,
          page: page,
          per_page: per_page,
        }
      );

      count += result.data.length;

      if (result.data.length < per_page) {
        commitsRemaining = false;
      } else {
        page++;
      }
    }

    log.info("Successfully found repository commit counts.\n");
  } catch (error) {
    log.debug("Could not find repository commit counts.\n");
  }

  return count;
}

export async function get_workingLifetime(
  repo: string,
  owner: string
): Promise<number> {
  // Get the working lifetime from date created to date of last commit
  // param: repo: name of repository
  // param: owner: name of owner of repository
  // return: number: working lifetime in milliseconds
  let workingLifetime = 0;
  let log: Logger = provider.getLogger("Parsed.get_working_lifetime");
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: owner,
      repo: repo,
    });
    const dateCreated = new Date(result.data.created_at);
    log.info("Data repository was created: " + dateCreated);

    const latestCommit = await octokit.request(
      "GET /repos/{owner}/{repo}/commits",
      {
        owner: owner,
        repo: repo,
        per_page: 1,
      }
    );
    const recCommit = new Date(latestCommit.data[0].commit.author.date);
    log.info("Latest commit: " + recCommit);

    workingLifetime = recCommit.getTime() - dateCreated.getTime();
    log.info("Successfully found the working lifetime in milliseconds.\n");
  } catch (error) {
    log.debug("Could not find the working lifetime.\n");
  }

  return workingLifetime;
}
