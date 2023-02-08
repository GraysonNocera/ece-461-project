import {describe, expect, test} from '@jest/globals';
import { get_readme_length } from "../src/clone_repo";

test("testing get_readme_length", async () => {
    let file_contents: Promise<string> = Promise.resolve("hello world")
    let expected: Promise<number> = Promise.resolve(11)
    let readme_length: Promise<number> = get_readme_length(file_contents)
    expect(await readme_length).toBe(await expected);
});