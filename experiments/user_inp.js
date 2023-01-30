"use strict";
exports.__esModule = true;
var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Is this example useful? [y/n] ', function (answer) {
    switch (answer.toLowerCase()) {
        case 'y':
            console.log('Super!');
            break;
        case 'n':
            console.log('Sorry! :(');
            break;
        default:
            console.log('Invalid answer!');
    }
    rl.close();
});
