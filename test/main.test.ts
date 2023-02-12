import { main } from "../src/main";
import { Runner } from "../src/runner_class";

// let mockCorrectness = jest.fn().mockImplementation(() => {});
// const mock = jest.fn().mockImplementation(() => {
//   return { calculate_correctness: mockCorrectness };
// });
// jest.mock("../src/runner_class", () => {
//   return jest.fn().mockImplementation(() => {
//     return { calculate_correctness: mockCorrectness };
//   });
// });
jest.mock("../src/runner_class");
jest.mock("../src/package_class");

describe("Test main", () => {
  test("try this", async () => {
    const pl = require("../src/parse_links");
    const cr = require("../src/clone_repo");

    let response = {
      data: {
        repository: {
          licenseInfo: { name: "big_dumb" },
          assignableUsers: { totalCount: 4 },
          hasIssuesEnabled: true,
          issues: { totalCount: 8675309 },
          open_issues: { totalCount: 100 },
          pullRequests: { totalCount: 78 },
          defaultBranchRef: { target: { history: { totalCount: 27 } } },
          last_pushed_at: "2022-03-28T08:02:43Z",
          stargazerCount: 14331,
        },
      },
    };

    jest.spyOn(pl, "npm_2_git").mockImplementation(async () => {
      return "https://github.com/GraysonNocera/ece-461-project";
    });
    jest.spyOn(pl, "getGitRepoDetails").mockImplementation(async () => {
      return { username: "billy", repoName: "bob_repo" };
    });
    jest.spyOn(pl, "graphAPIfetch").mockImplementation(async () => {
      return response;
    });
    jest.spyOn(pl, "gql_query").mockImplementation(async () => {
      return response;
    });
    jest.spyOn(pl, "get_recentCommits").mockImplementation(async () => {
      return 1;
    });
    jest.spyOn(cr, "get_info_from_cloned_repo").mockImplementation(async () => {
      return 1;
    });
    // jest.spyOn(R, "calculate_ramp").mockImplementation(async () => {
    //   return 0.5;
    // });
    // jest.spyOn(R, "calculate_license").mockImplementation(async () => {
    //   return 0.5;
    // });
    // jest.spyOn(R, "calculate_bus").mockImplementation(async () => {
    //   return 0.5;
    // });
    // jest.spyOn(R, "calculate_score").mockImplementation(async () => {
    //   return 0.5;
    // });
    process.argv[2] = "https://www.npmjs.com/package/browserify";
    main();
  });
});
