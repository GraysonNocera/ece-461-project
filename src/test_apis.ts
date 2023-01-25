// import { Endpoints } from "@octokit/types";

// type listUserReposParameters = Endpoints["GET /repos/{owner}/{repo}"]["parameters"];
// type listUserReposResponse = Endpoints["GET /repos/{owner}/{repo}"]["response"];

// async function listRepos(options: listUserReposParameters): listUserReposResponse["data"] {
//     const data = await options;
//     return data;
// }


function calculateTax(income: number, taxYear: number): number {
    if (taxYear < 2022)
        return income * 1.2;
    return income * 1.3;
}

calculateTax(10_000, 2022)