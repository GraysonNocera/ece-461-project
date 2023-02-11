import axios, { AxiosResponse } from "axios";
import { Package } from "./package_class";
let fs = require("fs");
const MAX_RETRIES = 1;
const isGitHubUrl = require("is-github-url");
import { Octokit as OctokitType } from "octokit";
const Octokit = OctokitType as any;

// GraphQL query to get the number of commits in the last year

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "using apis",
  timeZone: "Eastern",
  baseUrl: "https://api.github.com",
});

export function gql_query(username: string, repo: string) {
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
  // if (!URL.parse(npmUrl).hostname) {
  //   throw new Error(`Invalid NPM package URL: ${npmUrl}`);
  // }

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
      let new_url = packageInfo.repository.url;
      // console.log(new_url);
      if (new_url.startsWith("git+ssh://git@github.com")) {
        new_url = new_url.replace(
          "git+ssh://git@github.com",
          "git://github.com"
        );
        // console.log(new_url);

        return new_url;
      }
      // check if repository is on github
      if (isGitHubUrl(packageInfo.repository.url)) {
        return packageInfo.repository.url.replace("git+https", "git");
      } else {
        throw new Error(
          `Repository of package: ${packageName} is not on GitHub`
        );
      }
    } catch (error: any) {
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

export async function getGitRepoDetails(
  url: string
): Promise<{ username: string; repoName: string } | null> {
  // Function description
  // param: username: repository owner's username
  // param: repoName: respository name
  // return: null

  let log: Logger = provider.getLogger("URLParse.getGitRepoDetails");

  let match: RegExpMatchArray | null;
  //console.log (`\nParsing -> ${url}\n`)
  //console.log(url);

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
    //console.log (`getGitRepoDetails returns ${username}/${repoName}`);
    return { username, repoName };
  }

  console.error(`getGitRepoDetails returns Null; Nothing matched\n`);
  return null;
}

export async function graphAPIfetch(
  gql_query: string,
  package_test: Package
): Promise<any> {
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query: gql_query }),
    });

    const data = await response.json();

    //console.log("\nData Acquired From API\n");
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
    console.error(error);
  }
}

export async function get_recentCommits(
  package_instance: Package
): Promise<any> {
  let count = 0;
  let page = 1;
  let per_page = 30;
  let commitsRemaining = true;
  const recent = new Date();
  recent.setMonth(recent.getMonth() - 3);
  let sincedate = `${recent.getFullYear()}-${recent.getMonth()}-${recent.getDay()}`;
  //console.log(sincedate)

  try {
    while (commitsRemaining) {
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
    console.log(error);
    console.error("Could not find repository commit counts.");
  }
  package_instance.commit_count = count;
  return;
}

