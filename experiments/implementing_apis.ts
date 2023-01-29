import * as readline from 'readline';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a repo: ', (answer) => {
  
  rl.close();
});