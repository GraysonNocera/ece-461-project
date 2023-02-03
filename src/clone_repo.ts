// File for functions to get information from cloned repo
import fs from "fs";
import path from "path";
import cp from "child_process";
import { parse } from "csv-parse";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { emptyDirSync } from "fs-extra";

function clone_repo(repo_url: string, path_to_repo?: string, repo_name?: string): void {
    // Clone repo into path_to_repo + repo_name directory
    // :param repo_url: url to Github repo page
    // :param path_to_repo: (optional) path to repository
    // :param repo_name: (optional) name of repository

    if (!repo_name) {
        // Try to get it from parse github url function?
        repo_name = "placeholder text"
    }
    if (!path_to_repo) {
        // If no path_to_repo provided, assume current working directory
        path_to_repo = process.cwd()
    }

    // Create file or delete its contents if it exists
    let repo_base_dir = path.join(path_to_repo, repo_name)
    if (!fs.existsSync(repo_base_dir)) {
        fs.mkdirSync(repo_base_dir)
    } else {
        emptyDirSync(repo_base_dir)
    }

    // Create options for git object
    const options: Partial<SimpleGitOptions> = {
        baseDir: repo_base_dir,
        binary: 'git',
        maxConcurrentProcesses: 6,
        trimmed: false,
    };

    // Create git object
    const git: SimpleGit = simpleGit(options)

    // Clone repo
    git.clone(repo_url, repo_base_dir, {
        // Options go here
    }, (err, data) => {
        if (err)
            console.log("Error", err)
        if (data)
            console.log("Data", data)
    });

    return;
}

function get_readme_length(path_to_repo: string): number {
    // Get length in characters of a readme file
    // :param path_to_repo: absolute path to the base directory of the cloned repo
    // :return: number of characters in readme

    let file_contents: string;
    let file: string = path.join(path_to_repo, "README.md");
    
    try {
        file_contents = fs.readFileSync(file, "ascii");
    } catch(exception) {
        console.log("File not found\n");
        return 0;
    }

    return file_contents?.length;
}

function get_percentage_comments(path_to_repo: string): number {
    // Get the percentage of a src/ directory that is comments
    // :param path_to_repo: path to the repo
    // :return: percentage of src/ directory that is comments (num_comments / (num_comments + code))

    // Define path of src folder
    let src_folder: string = "\"" + path.join(path_to_repo, "src/") + "\"";

    // Terminal command, running cloc to get comment information
    let terminal_command: string = "cloc --by-percent cm --sum-one --yaml " + src_folder;

    // Run terminal output and conver to string
    let terminal_output: Buffer = cp.execSync(terminal_command);
    let data: string = terminal_output.toString()

    // Get percentage that src/ file is comments
    let percent: number = 0;
    let re: RegExp = new RegExp('comment:', 'i');
    let loc: number = data.search(re)
    data = data.substring(loc + "comment: ".length, data.length)
    percent = parseFloat(data.split('\n')[0])
    return percent
}

let path_to_repo = "/Users/graysonnocera/Desktop/Spring 2023/ECE 461/ece-461-project/"
let repo_url = "https://github.com/pyserial/pyserial"

// Clone the repo
clone_repo(repo_url, path_to_repo, "pyserial")

// Print readme length in characters and percentage of comments
console.log(get_readme_length(path_to_repo))
console.log(get_percentage_comments(path_to_repo))