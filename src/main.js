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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var parse_funcs_1 = require("./parse_funcs");
function sleep(ms) {
    // On the one hand, don't use it. On the other, I spent 3 hours (no joke) debugging
    // a race condition that could have been fixed with ```await sleep(500)```.
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var url, data, username, repoName, gitUrl, gitRepoDetails, gitRepoDetails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = process.argv[2];
                    if (!url) {
                        throw new Error("Please provide a URL as an argument when running the program.");
                    }
                    username = null;
                    repoName = null;
                    if (!url.startsWith("https://www.npmjs.com/")) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, parse_funcs_1.npm_2_git)(url)];
                case 1:
                    gitUrl = _a.sent();
                    return [4 /*yield*/, (0, parse_funcs_1.getGitRepoDetails)(gitUrl)];
                case 2:
                    gitRepoDetails = _a.sent();
                    if (gitRepoDetails) {
                        (username = gitRepoDetails.username, repoName = gitRepoDetails.repoName);
                    }
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, parse_funcs_1.getGitRepoDetails)(url)];
                case 4:
                    gitRepoDetails = _a.sent();
                    if (gitRepoDetails) {
                        (username = gitRepoDetails.username, repoName = gitRepoDetails.repoName);
                    }
                    _a.label = 5;
                case 5:
                    if (!(username != null && repoName != null)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, parse_funcs_1.fetchGithubAPI)((0, parse_funcs_1.gql_query)(username, repoName))];
                case 6:
                    data = _a.sent();
                    return [4 /*yield*/, sleep(1500)];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8: throw ("Unable to fetch repo -> ".concat(username, "/").concat(repoName));
                case 9:
                    console.log(data);
                    return [2 /*return*/];
            }
        });
    });
}
main();
