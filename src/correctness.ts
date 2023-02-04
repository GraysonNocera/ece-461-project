// import { Octokit } from "octokit";
import { request } from "http";
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

export async function get_issues(repo: string, owner: string): Promise<number> {
    let issuecount = 0;
    let page = 1;
    let per_page = 30;
    let issuesRemaining = true;
    
    try {
       issuecount = await octokit.paginate('GET /repos/{owner}/{repo}/issues{?state}',{
            owner:owner,
            repo: repo,
            state: "closed",
            since: "1999-01-23"
        });

        // while (issuesRemaining) {
        //     let result = await octokit.request('GET /repos/{owner}/{repo}/issues{?state,head,base,sort,direction,per_page,page}', {
        //         owner: owner,
        //         repo: repo,
        //         state: "closed",
        //         since: "1999-01-23",
        //         per_page: per_page,
        //         page: page
        //     });

        //     issuecount += result.data.length;

        //     if (result.data.length < per_page) {
        //         issuesRemaining = false;
        //     } else {
        //         page++;
        //     }
        // }
    } catch (error) {
        console.error("Could not find number of issues in repository.");
    }
    
    return issuecount;
}

export async function get_commitcount(repo: string, owner: string): Promise<number> {
    let count = 0;
    let page = 1;
    let per_page = 30;
    let commitsRemaining = true;
    try {
        while (commitsRemaining) {
            let result = await octokit.request(
                'GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,page,per_page}',
                {
                    owner: owner,
                    repo: repo,
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
        console.log(error)
        console.error("Could not find repository commit counts.");
    }
    return count;
}

export async function get_lifetime(repo: string, owner: string): Promise<string> {
    let created = "";

    try {
        let result = await octokit.request(
        'GET /repos/{owner}/{repo}',
        {
            owner: owner,
            repo: repo
        });

        created = result.data.created_at;
    } catch (error) {
        console.error("Could not find repository lifetime.");
    }

    return created;
}

export async function get_tcoverage(repo: string, owner: string): Promise<number> {
    let coverage = 0;

    try {
        console.log("Test coverage function has not been written yet.")
    } catch (error) {
        console.error("Could not find test coverage of the repository.");
    }
  
    return coverage;
}
