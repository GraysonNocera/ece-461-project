# Spring 2023 ECE 461 Project Part 1
###### Brian Yuan, Koltan Hauersperger, Grayson Nocera, Shantanu Sinha
## CLI for Trustworthy Modules
This project aims to use REST and GraphQL APIs to get metrics (bus factor; correctness; ramp up; responsive maintainer) of how trustworthy different packages and repositories are, and to rate these packages and repositories based off a "net score" using the metrics measured.

### Interaction

```./run install```
- Installs any dependencies
- Prints number of packages installed in accordance with the Sample I/O files on BrightSpace
- Returns 0 on `EXIT_SUCCESS`

```./run build ```
- Transpiles the TypeScript programs
- Returns 0 on `EXIT_SUCCESS`

```./run URL_FILE```
- URL_FILE is the absolute location of a file consisting of an ASCII-encoded newline-delimited set of URLs.
    - These URLs may be in the npmjs.com domain (e.g. https://www.npmjs.com/package/even) or come directly from GitHub (e.g. https://github.com/jonschlinkert/even)
    - Rates the package from [0, 1] as a weighted sum of package attributes
    - Outputs the Packages to Stdout in descending order of Net Score in a new-line delimited JSON format
- Returns 0 on `EXIT_SUCCESS`

```/run test```
- Prints to stdout how many tests cases passed, as well as the line coverage achieved
 `X/Y test cases passed. Z% line coverage achieved.`
- Returns 0 on `EXIT_SUCCESS`

### Grading
#### Notes on NodeJS
In accordance with Dr. Davis's instructions, we have included a version of NodeJS in our project. Our program uses this "vendored" Node which can be found in bin/bin/node. Since this is in our repository when cloned, running `cloc` on a cloned repository would yield mostly C code. For accurate line counts, the command `cloc ece-461-project --exclude-dir=bin,package.json,package-lock.json` should be run.


#### Upgrading NodeJS on Grading Environment
We have, of course, extensively tested our program with this vendored node version and we have tested our program on ECEProg. However, there's always potential (some would say proclivity) for software to break at the critical moment. We have worked very hard on this and would hate for it to go to waste because ECN couldn't upgrade the Node version on their machines.

The following are steps on how to manually update the NodeJS version for a particular user.

1. `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`
2. `export NVM_DIR="$HOME/.nvm"`
3. `[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`
4. `[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"`
5. `source ~/.bashrc`
6. `nvm install v18.14.0`
7. `nvm use v18.14.0`

Once these steps are run, the grading environment will have NodeJS v18.14. Please execute `./run URL_FILE.txt` again.

### Rating System
#### Ramp-up Time
Determines how easy it will be for a new engineer to get familiar with the package - good documentation, frequency of comments, README length, etc.
#### Correctness
Determines how reliable the package is using the number of issues, the number of commits, and the working lifetime of the project from the date it was created to the date of the last commit.
#### Bus Factor
Finds the number of people who can work on the package at any given moment. Also takes into account the number of recent commits in a timeframe of the past three months.
#### Responsiveness
Determines how "responsive" the package is to issues, commits, pull requests, etc. Takes into account the number of total commits, issues created recently, and the ratio of closed issues to open issues.
#### License Compatibility
Does the package have a license? If yes, then it will receive a high score. If no... then low. 

### Net Score
Based on the above metrics, the net score will be their weighted sum on a scale from 0 to 1 inclusive using the following formula: 
```(0.35 ∗ bF) + (0.25 ∗ L) + (0.2 ∗ C) + (0.1 ∗ rU) + (0.1 ∗ rM) = nS```
where bF is the bus factor; L is license; C is correctness; rU is ramp up; rM is responsive Maintainer; and nS is the net score of the package overall.