//*

// Run with ```tsc regextext.ts && node regextext.js```
// Change URL to demo

var url1 = "https://github.com/GraysonNocera/ece-461-project/tree/graphql";
var url2 = "https://github.com/webpack/webpack";
var url3 = "https://github.com/jonschlinkert/even";
var url4 = "git://github.com/jonschlinkert/even.git";
var url5 = "https://github.com/GraysonNocera/ece-461-project/tree/graphql";
var url6 = "git://github.com/webpack/webpack.git";


function getGitRepoDetails(url: string): {username: string, repo: string} | null {
    let match: RegExpMatchArray | null;
    if (url.startsWith("git://github.com/")) {
        match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
    } else {
        match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
    }
    if (match) {
        let repo = match[2];
        let username = match[1];
        return {username, repo};
    }
    return null;
}

console.log (getGitRepoDetails (url1));
console.log (getGitRepoDetails (url2));
console.log (getGitRepoDetails (url3));
console.log (getGitRepoDetails (url4));
console.log (getGitRepoDetails (url5));
console.log (getGitRepoDetails (url6));

//*/