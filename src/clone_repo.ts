// File for functions to get information from cloned repo
import fs from "fs";
import path from "path";

function get_readme_length(path_to_repo: string): number {
    // Get length in characters of a readme file
    // :param path_to_repo: absolute path to the base directory of the cloned repo
    // :return: number of characters in readme

    let file_contents: string;
    let file: string = path.join(path_to_repo, "README.md");

    // Assume we are in the base path of the repo we just cloned
    try {
        file_contents = fs.readFileSync(file, "ascii");
    } catch(exception) {
        console.log("File not found\n");
        return 0;
    }

    return file_contents?.length;
}

console.log(get_readme_length("./src"))