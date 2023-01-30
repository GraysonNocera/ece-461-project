import {npm_2_git, getGitRepoDetails, fetchGithubAPI, gql_query} from './parse_funcs';
import { url_class } from './url_class';

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

    console.log (username, repoName);

    if (username != null && repoName != null) {
        data = fetchGithubAPI(gql_query(username, repoName));
    }

    else {
        console.error (`Unable to fetch repo -> ${username}/${repoName}`);
    }
}

main();
