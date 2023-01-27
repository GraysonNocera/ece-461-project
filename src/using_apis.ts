import { Octokit } from "octokit";
import * as readline from 'readline';

// Set up authentication token
// To do this, I copied and pasted my github token into an environment variable
// in vs code and referenced it in this line
const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN,
});

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

rl.question('Is this example useful? [y/n] ', (answer) => {
switch(answer.toLowerCase()) {
    case 'y':
    console.log('Super!');
    break;
    case 'n':
    console.log('Sorry! :(');
    break;
    default:
    console.log('Invalid answer!');
}
rl.close();
});



// Async functions must return a Promise type
export async function myFunc(): Promise<void> {

    // This call will pull 4 issues from the repo ece-461-project using the personal access
    // token above and store the result/data in the variable result
    let result = await octokit.request("GET /repos/" + process.env.GITHUB_LOGIN + "/ece-461-project/issues", {
        owner: "github",
        repo: "ece-461-project",
        per_page: 4
    });

    // Get pull request #5 from our repo
    let another_result = await octokit.rest.pulls.get({
        owner: "GraysonNocera",
        repo: "ece-461-project",
        pull_number: 5,
        mediaType: {
          format: "raw",
        },
    })


    // console.log(result.data)
    // console.log(another_result.data)

    // Get pull request title
    // console.log(another_result.data["title"])
    // console.log(result.headers)
    // console.log(result.status)
    // console.log(result.url)

    // console.log("\n\n\n\n\n\n" + result.data["title"])
    let countIss = 0
    // Iterate through the issues and print their title
    for (let i = 0; i < result.data.length; i++) {
        countIss++ // console.log(result.data[i]["title"])
    }
}

myFunc()