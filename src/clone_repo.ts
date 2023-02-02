// File for functions to get information from cloned repo
import fs from "fs";
import path from "path";
import cp from "child_process";
import { parse } from "csv-parse";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { emptyDirSync } from "fs-extra";

function clone_repo(repo_url: string, path_to_repo: string, repo_name?: string): void {

    if (!repo_name) {
        // Try to get it from parse github url function?
        repo_name = "placeholder text"
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
        console.log("Error", err)
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

    let percent = 0;
    let src_folder: string = "\"" + path.join(path_to_repo, "src/") + "\"";
    let data_file: string = "\"" + path.join(path_to_repo, "data.txt") + "\"";
    let terminal_command: string = "cloc --by-percent cm --sum-one --report-file=" + data_file + " --csv " + src_folder;
    let terminal_output = cp.exec(terminal_command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
        }
    });
    
    data_file = path.join(path_to_repo, "data.txt")
    const csv_file_content = fs.readFileSync(data_file, "ascii");
    const csv_data = parse(csv_file_content, (err, records, info) => {
        console.log("Error: ", err);
    });
    //console.log(csv_data)

    return percent
}

let path_to_repo = "/Users/graysonnocera/Desktop/Spring 2023/ECE 461/ece-461-project/"
let repo_url = "https://github.com/pyserial/pyserial"
clone_repo(repo_url, path_to_repo, "pyserial")
// console.log(get_readme_length(path_to_repo))
// console.log(get_percentage_comments(path_to_repo))