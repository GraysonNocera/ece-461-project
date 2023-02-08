# ece-461-project
ECE 461: Software Engineering group project

This is our README.

Names:
Brian Yuan,
Koltan Hauersperger, 
Grayson Nocera,
Shantanu Sinha


# Spring 2023 ECE 461 Project Part 1
## CLI for Trustworthy Modules
This project aims to use REST and GraphQL APIs to get metrics (bus factor; correctness; ramp up; responsive maintainer) of how trustworthy different packages and repositories are, and to rate these packages and repositories based off a "net score" using the metrics measured.

### Interaction

```./run install```
- installs any dependencies
- returns 0 on EXIT_SUCCESS

```./run build ```
- completes any compilation needed
- returns 0 on EXIT_SUCCESS

```./run URL_FILE```
- URL_FILE is the absolute location of a file consisting of an ASCII-encoded newline-delimited set of URLs.
    - these URLs may be in the npmjs.com domain (e.g. https://www.npmjs.com/package/even) or come directly from GitHub (e.g. https://github.com/jonschlinkert/even)
    - rates the package from [0, 1] as a weighted sum of package attributes
- returns 0 on EXIT_SUCCESS

```/run test```
- prints to stdout how many tests passed: `X/Y test cases passed. Z% line coverage achieved.`
- returns 0 on EXIT_SUCCESS

