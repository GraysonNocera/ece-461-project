let fs = require("fs");


// Given a Repo URL, uses REGEX to grab the repo and owner name
// I **THINK** it works with any (GitHub) URL they can throw at us, but I haven't exhaustively tested it
// To test the REGEX function, compile and run regextext.ts with different inputs.

function getRepoDetails(url: string) {
    const regex = /(?:https:\/\/github.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/;
    const match = regex.exec(url);
    if (match) {
        const [, username, repoName] = match;
        return { username, repoName };
    }
    return null;
}

const arg = process.argv.slice(2);
const {username, repoName} = getRepoDetails(arg[0]) || {};

// https://docs.github.com/en/graphql/overview/explorer
// The explorer is magic for testing GraphQL queries

// Also Watch 5 minutes from 20:13 for the best GraphQL tutorial you've ever seen (Statistically True!) -> https://www.youtube.com/watch?v=fVmQCnQ_EPs 

var gql_query = 
`
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
        "Authorization" : `Token ${process.env.GITHUB_TOKEN}`
    },
    body: JSON.stringify({query : gql_query})
}).then(data => data.json())
.then(data => {
    let str = JSON.stringify(data, null, 4);

    fs.writeFile("API_RETURN.json", str, function(err: any) {
        if (err) {
            console.log(err);
        } else {
            console.log("API Return Saved to File for further parsing!");
        }
    });
    
});