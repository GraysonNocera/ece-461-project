import { Octokit } from "octokit";

// Set up authentication token
// To do this, I copied and pasted my github token into an environment variable
// in vs code and referenced it in this line
const octokit = new Octokit({ 
  auth: process.env.GRAYSON_GITHUB_TOKEN,
});

// Async functions must return a Promise type
async function myFunc(): Promise<void> {

    // This call will pull 4 issues from the repo ece-461-project using the personal access
    // token above and store the result/data in the variable result
    let result = await octokit.request("GET /repos/GraysonNocera/ece-461-project/issues", {
        owner: "github",
        repo: "ece-461-project",
        per_page: 4
    });

    console.log(result.data)
    // console.log(result.headers)
    // console.log(result.status)
    // console.log(result.url)

    console.log("\n\n\n\n\n\n" + result.data["title"])
    
    // Iterate through the issues and print their title
    for (let i = 0; i < result.data.length; i++) {
        console.log(result.data[i]["title"])
    }
}

myFunc()