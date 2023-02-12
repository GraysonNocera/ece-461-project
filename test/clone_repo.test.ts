// File for functions to get information from cloned repo
import path from "path";
import * as cr from "../src/clone_repo";
import { Package } from "../src/package_class";

// Set timeout to 60 seconds
jest.setTimeout(60 * 1000)

describe("Tests for clone_repo.ts", () => {
  test.each([
    { repo_name: "lodash", path_to_repo: "" },
    { repo_name: "browserify", path_to_repo: process.cwd() },
  ])("test create_git_object", ({ repo_name, path_to_repo }) => {
    let git = cr.create_git_object(repo_name, path_to_repo);
    cr.delete_repo(path.join(path_to_repo, repo_name));
    expect(git).toBeDefined();
  });

  test("test get_readme_length", async () => {
    let file_contents: Promise<string> = Promise.resolve("hello world");
    let expected: Promise<number> = Promise.resolve(11);
    let readme_length: Promise<number> = cr.get_readme_length(file_contents);
    expect(await readme_length).toBe(await expected);
  });

  test("test get_readme_path", async () => {
    let repo_base_dir: string = process.cwd()
    let readme_path: string = cr.get_readme_path(repo_base_dir)
    let to_equal: string = path.join(process.cwd(), "README.md")
    expect(readme_path).toEqual(to_equal)
  });

  test.each([
    { file_contents: "This readme has no license", has_license: false },
    { file_contents: "Package has LGPL v3", has_license: true },
  ])("test has_correct_license_in_readme", async ({ file_contents, has_license }) => {
    let found_license: Promise<boolean> = cr.has_correct_license_in_readme(Promise.resolve(file_contents))
    expect(await found_license).toEqual(has_license)
  });

  test.each([
    { package_instance: new Package("https://github.com/cloudinary/cloudinary_npm", "cloudinary_npm") },
  ])("test get_info_from_cloned_repo", async ({ package_instance} ) => {
    await cr.get_info_from_cloned_repo(package_instance)
  })
});
