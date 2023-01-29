import * as readline from 'readline';
import {myFunc} from 'using_apis';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a repo: ', (answer) => {
  
  rl.close();
});