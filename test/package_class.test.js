"use strict";
exports.__esModule = true;
var package_class_1 = require("../src/package_class");
describe("test initializing Package", function () {
    test("initialize left empty", function () {
        var test = new package_class_1.Package();
        expect(test.bus_factor).toBe(0);
    });
});
