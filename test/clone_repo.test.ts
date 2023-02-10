// File for functions to get information from cloned repo

import * as cr from "../src/clone_repo";
jest.mock("simple-git")
jest.mock("fs")
jest.mock("typescript-logging-log4ts-style")
jest.mock("fs-extra")
jest.mock("typescript-logging")
jest.mock("path")
jest.mock("child_process")

describe("Tests for clone_repo.ts", () => {
    test.each([
        {repo_name: "cloudinary_npm", path_to_repo: ""},
        {repo_name: "browserify", path_to_repo: process.cwd()}
    ])("test create_git_object", ({repo_name, path_to_repo}) => {
        let git = cr.create_git_object(repo_name, path_to_repo)
        expect(git).toBeDefined()
    })

    test("test get_readme_length", async () => {
        let file_contents: Promise<string> = Promise.resolve("hello world")
        let expected: Promise<number> = Promise.resolve(11)
        let readme_length: Promise<number> = cr.get_readme_length(file_contents)
        expect(await readme_length).toBe(await expected);
    });

    test("test clone_repo", async () => {
        
    })

});
