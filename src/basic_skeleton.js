"use strict";
exports.__esModule = true;
var url_class_1 = require("./url_class");
function test(owner, repo) {
    if (owner === void 0) { owner = ""; }
    if (repo === void 0) { repo = ""; }
    //pass in repo and owner of repo to initialize the url class
    var test = new url_class_1.url_class("", repo, owner);
    test.calculate_correctness();
}
//const var1 = process.argv[2];
//const var2 = process.argv[3];
//test(var1, var2)
test("GraysonNocera", "ece-461-project");
