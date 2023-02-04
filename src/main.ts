import {npm_2_git, getGitRepoDetails, graphAPIfetch, gql_query} from './parse_links';
import { package_class } from './package_class';
import { Runner } from './runner_class';

function sleep(ms: number) {
    // On the one hand, don't use it. On the other, I spent 3 hours (no joke) debugging
    // a race condition that could have been fixed with ```await sleep(500)```.
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {    
    let url = process.argv[2];
    var data;
    
    if (!url) {
        throw new Error("Please provide a URL as an argument when running the program.");
    }

    let username: string | null = null;
    let repoName: string | null = null;

   
    if (url.startsWith("https://www.npmjs.com/package/")) {
        let gitUrl = await npm_2_git(url);
        let gitRepoDetails = await getGitRepoDetails(gitUrl);
        
        if (gitRepoDetails) {
            ({username, repoName} = gitRepoDetails);
        }
    }
    else {
        let gitRepoDetails = await getGitRepoDetails(url);
        if (gitRepoDetails) {
            ({username, repoName} = gitRepoDetails);
        }
    }

    if (username != null && repoName != null) {
        data = await graphAPIfetch(gql_query(username, repoName)).catch((error) => {
            console.log (`Error: ${error}`);
        });
    }

    else {
        throw new Error (`Unable to fetch repo -> ${username}/${repoName}`);
    }

    console.log (data);

    if (data["message"] == `Bad credentials`) {
        console.log (`Bad credentials. Please check your token.`);
        throw new Error ("Bad credentials. Please check your token.");
    }
 
    
}

main();
