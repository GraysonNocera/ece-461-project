import { Runner } from '../src/runner_class';
import * as fs from 'fs';
// Given a Repo URL, uses REGEX to grab the repo and owner name
// I **THINK** it works with any (GitHub) URL they can throw at us, but I haven't exhaustively tested it
// To test the REGEX function, compile and run regextext.ts with different inputs.

function getGitRepoDetails(url: string): {username: string, repoName: string} | null {
    let match: RegExpMatchArray | null;
    if (url.startsWith("git://github.com/")) {
        match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
    } else {
        match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
    }
    if (match) {
        let repoName = match[2];
        let username = match[1];
        return {username, repoName};
    }
    return null;
}

async function fetchGithubAPI(gql_query: string): Promise<any> {
    try {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.GITHUB_TOKEN}`
        },
        body: JSON.stringify({ query: gql_query })
      });

      const data = await response.json();

      fs.writeFile("API_RETURN.json", JSON.stringify(data, null, 4), function (err: any) {
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

const arg = process.argv.slice(2);
const {username, repoName} = getGitRepoDetails(arg[0]) || {};


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

var data = fetchGithubAPI (gql_query);
//var curr_package = new Runner("sshUrl", repoName, username);


