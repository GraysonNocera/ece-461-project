import * as pl from "../src/parse_links";
import mockAxios from "axios";
import mockOctokit from "octokit";
import { Package } from "../src/package_class";

jest.mock("axios");
jest.mock("octokit");

describe("Test parse_links.ts", () => {
  test.each([
    {
      npm_link: "https://www.npmjs.com/package/cloudinary",
      github_link: "https://github.com/cloudinary/cloudinary_npm",
    },
  ])("test npm_2_git", async ({ npm_link, github_link }) => {
    mockAxios.get = jest
      .fn()
      .mockReturnValue({ data: { repository: { url: github_link } } });
    expect(await pl.npm_2_git(npm_link)).toEqual(github_link);
  });

  test.each([
    {
      github_link: "https://github.com/andreax79/airflow-code-editor",
      expected_owner: "andreax79",
      expected_repo: "airflow-code-editor",
    },
  ])(
    "test getGitRepoDetails",
    async ({ github_link, expected_owner, expected_repo }) => {
      let result = pl.getGitRepoDetails(github_link);
      expect((await result)?.username).toEqual(expected_owner);
      expect((await result)?.repoName).toEqual(expected_repo);
    }
  );

  test.each([{ username: "andreax79", repo: "airflow-code-editor" }])(
    "test graphAPIfetch",
    async ({ username, repo }) => {

      let response = {
        data: {
          repository: {
            assignableUsers: { totalCount: 4 },
            open_issues: { totalCount: 7 },
            stargazerAccount: 6,
          },
        },
      };


      let gql_query: string = pl.gql_query(username, repo);
      let package_instance: Package = new Package();

      global.fetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve(response)
      })) as jest.Mock;

      await pl.graphAPIfetch(gql_query, package_instance);

      expect(package_instance.num_stars).toEqual(
        response.data.repository.stargazerAccount
      );
      expect(package_instance.num_dev).toEqual(
        response.data.repository.assignableUsers.totalCount
      );
      expect(package_instance.issues_active).toEqual(
        response.data.repository.open_issues.totalCount
      );
    }
  );

  
});
