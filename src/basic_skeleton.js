"use strict";
exports.__esModule = true;
var url_class_1 = require("./url_class");
function test() {
    var test = new url_class_1.url_class("", "ece-461-project", "GraysonNocera");
    test.calculate_correctness();
}
test();
