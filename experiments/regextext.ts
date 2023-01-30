/*

// Run with ```tsc regextext.ts && node regextext.js```
// Change URL to demo

var url = "https://github.com/GraysonNocera/ece-461-project/tree/graphql";


function getRepoDetails(url: string) {
    const regex = /(?:https:\/\/github.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/;
    const match = regex.exec(url);
    if (match) {
        const [, username, repoName] = match;
        return { username, repoName };
    }
    return null;
}

console.log (getRepoDetails (url));


*/