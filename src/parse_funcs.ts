import axios, { AxiosResponse } from "axios";
import isGitHubUrl = require("is-github-url");
import * as URL from "url";
let fs = require("fs");

const MAX_RETRIES = 1;

///*
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

export async function graphAPIfetch(gql_query: string): Promise<any> {
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

      fs.promises.writeFile("API_RETURN.json", JSON.stringify(data, null, 4), function (err: any) {
        if (err) {
          console.log(err);
        } else {
          console.log("API Return Saved to File for further parsing!");
        }
      });

      return data;
    } catch (error) {
      console.error(error);
    }
}



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
  