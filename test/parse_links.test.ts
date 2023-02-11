import * as pl from "../src/parse_links";
import mockAxios from "axios";
// import mockOctokit from "octokit";
import { Package } from "../src/package_class";
import { Octokit } from "octokit";

// jest.mock("axios");
// //jest.mock("octokit");
// jest.mock('@octokit/rest')

const mockOctokit = require("octokit")

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
      npm_link: "https://www.npmjs.com/package/browserify",
      github_link: "git://github.com/browserify/browserify.git",
    },
  ])("test npm_2_git ssh", async ({ npm_link, github_link }) => {
    mockAxios.get = jest.fn().mockReturnValue({
      data: {
        repository: {
          url: "git+ssh://git@github.com/browserify/browserify.git",
        },
      },
    });
    expect(await pl.npm_2_git(npm_link)).toEqual(github_link);
  });

  test.each([
    {
      npm_link: "https://www.npmjs.com/your_mom",
      github_link: "https://github.com/cloudinary/cloudinary_npm",
    },
  ])("test npm_2_git error", async ({ npm_link, github_link }) => {
    mockAxios.get = jest.fn().mockReturnValue({
      data: { url: "https://github.com/" },
    });

    expect(async () => {
      await pl.npm_2_git(npm_link);
    }).rejects.toThrow("No repository found for package: your_mom");
  });

  test.each([
    {
      npm_link: "https://www.npmjs.com/your_mom",
      github_link: "https://github.com/cloudinary/cloudinary_npm",
    },
  ])("test npm_2_git error", async ({ npm_link, github_link }) => {
    mockAxios.get = jest.fn().mockReturnValue({
      data: { repository: { url: "https://git_hub.com/" } },
    });

    expect(async () => {
      await pl.npm_2_git(npm_link);
    }).rejects.toThrow("Repository of package: your_mom is not on GitHub");
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

      let gql_query: string = pl.gql_query(username, repo);
      let package_instance: Package = new Package();

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;
      let data2 = JSON.stringify(response);
      let data3 = JSON.parse(data2);
      await pl.graphAPIfetch(gql_query, package_instance);

      expect(package_instance.num_stars).toEqual(
        data3.data.repository.stargazerCount
      );
      expect(package_instance.num_dev).toEqual(
        data3.data.repository.assignableUsers.totalCount
      );
      expect(package_instance.issues_active).toEqual(
        data3.data.repository.open_issues.totalCount
      );
      expect(package_instance.issues).toEqual(
        data3.data.repository.issues.totalCount
      );
      expect(package_instance.total_commits).toEqual(
        data3.data.repository.defaultBranchRef.target.history.totalCount
      );
      expect(package_instance.pr_count).toEqual(
        data3.data.repository.pullRequests.totalCount
      );
      expect(package_instance.last_pushed_at).toEqual(
        data3.data.repository.last_pushed_at
      );
      expect(package_instance.license_name).toEqual(
        data3.data.repository.licenseInfo.name
      );
    }
  );
  test.each([{ username: "andreax79", repo: "airflow-code-editor" }])(
    "test graphAPIfetch null",
    async ({ username, repo }) => {
      let response = {
        data: {
          repository: {
            licenseInfo: null,
            assignableUsers: { totalCount: null },
            hasIssuesEnabled: false,
            issues: { totalCount: null },
            open_issues: { totalCount: null },
            pullRequests: { totalCount: null },
            defaultBranchRef: { target: { history: { totalCount: null } } },
            last_pushed_at: null,
            stargazerCount: null,
          },
        },
      };

      let gql_query: string = pl.gql_query(username, repo);
      let package_instance: Package = new Package();

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;
      let data2 = JSON.stringify(response);
      let data3 = JSON.parse(data2);
      await pl.graphAPIfetch(gql_query, package_instance);

      expect(package_instance.num_stars).toEqual(0);
      expect(package_instance.num_dev).toEqual(null);
      expect(package_instance.issues_active).toEqual(-1);
      expect(package_instance.issues).toEqual(-1);
      expect(package_instance.total_commits).toEqual(0);
      expect(package_instance.pr_count).toEqual(0);
      expect(package_instance.last_pushed_at).toEqual("");
      expect(package_instance.license_name).toEqual("no name");
    }
  );

  test.each([{ username: "andreax79", repo: "airflow-code-editor" }])(
    "test graphAPIfetch error case",
    async ({ username, repo }) => {
      let response = {
        data: {
          repository: {
            licenseInfo: null,
            assignableUsers: null,
          },
        },
      };

      let gql_query: string = pl.gql_query(username, repo);
      let package_instance: Package = new Package();

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;
      let data2 = JSON.stringify(response);
      let data3 = JSON.parse(data2);
      await pl.graphAPIfetch(gql_query, package_instance);

      expect(package_instance.num_dev).toEqual(0);
    }
  );

  // test.only("test get_commitCount", async () => {
  //   let response = {
  //     data: {
  //       length: 60,
  //     },
  //   };
  //   mockOctokit.request.mockImplementationOnce(() => Promise.resolve(response));
  //   let package_instance: Package = new Package();
  //   await pl.get_recentCommits(package_instance);

  //   console.log(pl.get_recentCommits(package_instance));
  // });
});
