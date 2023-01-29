// Given a Repo URL, uses REGEX to grab the repo and owner name
// Run with ```tsc regextext.ts && node regextext.js```

function getRepoDetails(url: string) {
    const regex = /(?:https:\/\/github.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/;
    const match = regex.exec(url);
    if (match) {
        const [, username, repoName] = match;
        return { username, repoName };
    }
    return null;
}


var url = "https://github.com/GraysonNocera/ece-461-project/tree/graphql";
console.log (getRepoDetails (url));