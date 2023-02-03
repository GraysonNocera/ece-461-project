"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_links_1 = require("./parse_links");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let url = process.argv[2];
        var data;
        if (!url) {
            throw new Error("Please provide a URL as an argument when running the program.");
        }
        let username = null;
        let repoName = null;
        if (url.startsWith("https://www.npmjs.com/package/")) {
            let gitUrl = yield (0, parse_links_1.npm_2_git)(url);
            let gitRepoDetails = yield (0, parse_links_1.getGitRepoDetails)(gitUrl);
            if (gitRepoDetails) {
                ({ username, repoName } = gitRepoDetails);
            }
        }
        else {
            let gitRepoDetails = yield (0, parse_links_1.getGitRepoDetails)(url);
            if (gitRepoDetails) {
                ({ username, repoName } = gitRepoDetails);
            }
        }
        if (username != null && repoName != null) {
            data = yield (0, parse_links_1.graphAPIfetch)((0, parse_links_1.gql_query)(username, repoName)).catch((error) => {
                console.log(`Error: ${error}`);
            });
        }
        else {
            throw new Error(`Unable to fetch repo -> ${username}/${repoName}`);
        }
        console.log(data);
        if (data["message"] == `Bad credentials`) {
            console.log(`Bad credentials. Please check your token.`);
            throw new Error("Bad credentials. Please check your token.");
        }
    });
}
main();
//# sourceMappingURL=main.js.map