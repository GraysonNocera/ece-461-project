import { Logger } from "typescript-logging-log4ts-style";
import { provider } from "../src/logging";
import { ensure_graphQL_fetch, handle_url } from "../src/main";

jest.mock("../src/runner_class");
jest.mock("../src/package_class");

describe("Test main", () => {

  test.each([
    {
      url: "https://github.com/lodash/lodash",
      exp_username: "lodash",
      exp_repoName: "lodash",
      exp_url: "https://github.com/lodash/lodash",
    },
  ])(
    "test handle_url",
    async ({ url, exp_username, exp_repoName, exp_url }) => {
      let new_url: string = "";
      let username: string = "";
      let reponame: string = "";

      ({
        username: username,
        repoName: reponame,
        url: new_url,
      } = await handle_url(url));

      expect(new_url).toEqual(exp_url);
      expect(username).toEqual(exp_username);
      expect(reponame).toEqual(exp_repoName);
    }
  );

  test.each([
    { data: {message: "Bad credentials"}, expected: false },
    { data: undefined, expected: false },
    { data: {message: "Success"}, expected: true }
  ])("test ensure_graphQL_fetch", ({data, expected}) => {
    let log: Logger = provider.getLogger("Test")
    let result: boolean = ensure_graphQL_fetch(data, log)
    expect(result).toEqual(expected)
  })
});
