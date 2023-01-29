"use strict";
function* generator() {
    console.log("Generator is starting");
    yield 1;
    console.log("Middle of generator");
    yield 2;
    console.log("Generator finished");
}
function calculateTax(income, taxYear) {
    if (taxYear < 2022)
        return income * 1.2;
    return income * 1.3;
}
calculateTax(10000, 2022);
let gen = generator();
console.log(gen.next());
console.log("Control is back with main");
console.log(gen.next());
let result = gen.next();
console.log(result.value);
console.log(result.done);
//# sourceMappingURL=test_apis.js.map