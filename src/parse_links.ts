import axios, { AxiosResponse } from "axios";
import { Package } from "./package_class";
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
  // Query to be passed to graphQL
  // :param username: GitHub username of repository owner
  // :param repo: repository name of GitHub repo

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

export async function npm_2_git(npmUrl: string): Promise<string> {
  // Takes a NPM package URL and returns the GitHub URL
  // :param npmUrl: npm URL provided by text file
  // :return: Promise of corresponding GitHub url string

  let log: Logger = provider.getLogger("URLParse.npm_2_git");

  // extract the package name from the npm URL
  const packageName = npmUrl.split("/").pop();
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      log.info("Converting npm link (" + npmUrl + ") to GitHub link...");

      // use the npm registry API to get the package information
      const response: AxiosResponse = await axios.get(
        `https://registry.npmjs.org/${packageName}`
      );
      const packageInfo = response.data;

      // check if package has repository
      if (!packageInfo.repository) {
        log.debug(`No repository found for package: ${packageName}`);
        return Promise.resolve("");
      }
      let new_url = packageInfo.repository.url;

      // Convert ssh to https url
      if (new_url.startsWith("git+ssh://git@github.com")) {
        new_url = new_url.replace(
          "git+ssh://git@github.com",
          "git://github.com"
        );

        log.info("Converted npm link to " + new_url);

        return new_url;
      }
      // check if repository is on github
      if (isGitHubUrl(packageInfo.repository.url)) {
        return packageInfo.repository.url.replace("git+https", "git");
      } else {
        log.debug(`Repository of package: ${packageName} is not on GitHub`);
        return Promise.resolve("");
      }
    } catch (error: any) {
      // Error in getting GitHub url
      log.debug("Received error: " + error);
      if (error.response && error.response.status === 404) {
        log.debug(`Package not found: ${packageName}`);
        return Promise.resolve("");
      } else if (error.response && error.response.status === 429) {
        log.debug(
          `Rate limit exceeded: ${error.response.headers["Retry-After"]} seconds`
        );
        return Promise.resolve("");
      } else if (error.code === "ECONNREFUSED") {
        log.debug(`Error: ${error.code}. Retrying...`);
        retries++;
        continue;
      } else {
        log.debug(
          "Respository of package: " + packageName + " is not on GitHub"
        );
        return Promise.resolve("");
      }
    }
  }

  log.debug(`Error: Maximum retries exceeded for package: ${packageName}`);
  return Promise.resolve("");
}

export async function getGitRepoDetails(
  url: string
): Promise<{ username: string; repoName: string } | null> {
  // Function description
  // :param url: string url to parse
  // :return: Promise of a username and reponame extracted from
  // url or null

  let log: Logger = provider.getLogger("URLParse.getGitRepoDetails");

  let match: RegExpMatchArray | null;

  log.info("Getting info from GitHub link...");
  if (url.startsWith("git:")) {
    // Parse ssh gitHub link
    match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  } else {
    // Parse https github link
    match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
  }

  // Assign username and repoName from URL regex
  if (match) {
    let repoName = match[2];
    let username = match[1];
    log.info(`getGitRepoDetails returns ${username}/${repoName}`);
    return { username, repoName };
  }

  log.debug(`getGitRepoDetails returns Null; Nothing matched\n`);
  return null;
}

export async function graphAPIfetch(
  gql_query: string,
  package_test: Package
): Promise<any> {
  // Fetch data from GraphQL
  // :param gql_query: string query to be passed to GraphQL
  // :param package_test: instance of Package class for holding data
  // returned from GraphQL fetch
  // :return: data received

  let log: Logger = provider.getLogger("GraphQL.graphAPIfetch");

  try {

    // Fetch the GraphQL API
    log.info("Getting graphQL response...");
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query: gql_query }),
    });

    const data = await response.json();

    log.info("Data acquired from graphQL: " + data);

    // Get data in usable format
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

    // Get data about the package
    if (data3.data.repository.defaultBranchRef.target.history.totalCount) {
      package_test.total_commits =
        data3.data.repository.defaultBranchRef.target.history.totalCount;
    } else {
      package_test.total_commits = 0;
    }
    if (data3.data.repository.pullRequests.totalCount) {
      package_test.pr_count = data3.data.repository.pullRequests.totalCount;
    } else {
      package_test.pr_count = 0;
    }
    if (data3.data.repository.last_pushed_at != null) {
      package_test.last_pushed_at = data3.data.repository.last_pushed_at;
    }
    if (data3.data.repository.stargazerCount != null) {
      package_test.num_stars = data3.data.repository.stargazerCount;
    } else {
      package_test.num_stars = 0;
    }
    if (data3.data.repository.licenseInfo != null) {
      package_test.license_name = data3.data.repository.licenseInfo.name;
    } else {
      package_test.license_name = "no name";
    }

    return data;
  } catch (error) {
    log.debug("graphQL API failed with error: " + error);
  }
}

export async function get_recentCommits(
  package_instance: Package
): Promise<any> {
  // Get recent commits of a repository
  // :param package_instance: instance of Package class for holding data
  // :return: none

  let count = 0;
  let page = 1;
  let per_page = 30;
  let commitsRemaining = true;
  const recent = new Date();
  recent.setMonth(recent.getMonth() - 3);
  let sincedate = `${recent.getFullYear()}-${recent.getMonth()}-${recent.getDay()}`;

  let log: Logger = provider.getLogger("REST.get_recentCommits");

  try {
    while (commitsRemaining) {
      log.info("Getting recent commits");

      // Sucessively grab commits
      let result = await octokit.request(
        "GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,page,per_page}",
        {
          owner: package_instance.owner,
          repo: package_instance.repo,
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
  } catch (error) {
    log.debug(
      "Could not find repository commit counts. Received error: " + error
    );
  }
  package_instance.commit_count = count;
  return;
}
