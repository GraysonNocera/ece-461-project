import * as cr from "../src/clone_repo";

describe("Tests for clone_repo.ts", () => {
    test.each([
        {repo_name: "cloudinary_npm", path_to_repo: ""},
        {repo_name: "browserify", path_to_repo: process.cwd()}
    ])("test create_git_object", ({repo_name, path_to_repo}) => {
        let git = cr.create_git_object(repo_name, path_to_repo)
        expect(git).toBeDefined()
    })

    test("testing get_readme_length", async () => {
        let file_contents: Promise<string> = Promise.resolve("hello world")
        let expected: Promise<number> = Promise.resolve(11)
        let readme_length: Promise<number> = cr.get_readme_length(file_contents)
        expect(await readme_length).toBe(await expected);
    });


});
