"use strict";
let fs = require("fs");
function getRepoDetails(url) {
    const regex = /(?:https:\/\/github.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/;
    const match = regex.exec(url);
    if (match) {
        const [, username, repoName] = match;
        return { username, repoName };
    }
    return null;
}
const arg = process.argv.slice(2);
const { username, repoName } = getRepoDetails(arg[0]) || {};
var gql_query = `
{
    repository(owner: "webpack", name: "webpack") {
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
fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
        "Authorization": `Token ${process.env.GITHUB_TOKEN}`
    },
    body: JSON.stringify({ query: gql_query })
}).then(data => data.json())
    .then(data => {
    console.log(data);
    let str = JSON.stringify(data, null, 4);
    fs.writeFile("API_RETURN.json", str, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("API Return Saved to File for further parsing!");
        }
    });
});
//# sourceMappingURL=graphql.js.map