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
        console.log(error)
        console.error("Could not find repository commit counts.");
    }
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