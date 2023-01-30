import {npm_2_git, getGitRepoDetails, graphAPIfetch, gql_query} from './parse_funcs';
import { url_class } from './url_class';

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

    if (url.startsWith("https://www.npmjs.com/")) {
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
        data = await graphAPIfetch(gql_query(username, repoName));
    }

    else {
        throw (`Unable to fetch repo -> ${username}/${repoName}`);
    }

    console.log (data); // I have data up to this point. A nice JSON object (I think?)
    // I can't parse it to save my life. plis help
    // look at API_RETURN.json to "see" what the data looks like.
}


main();

