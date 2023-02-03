// File for functions to get information from cloned repo
import fs from "fs";
import path from "path";
import cp from "child_process";
import simpleGit, { SimpleGit, SimpleGitOptions, gitP } from "simple-git";
import { emptyDirSync } from "fs-extra";

function create_git_object(path_to_repo?: string, repo_name?: string): SimpleGit {
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

    return git
}

async function clone_repo(repo_url: string, repo_base_dir: string, git: SimpleGit): Promise<void> {

    // Clone repo
    await git.clone(repo_url, repo_base_dir, {
        //Options go here
    }, (err, data) => {
        if (err)
            console.log("Error", err)
        if (data)
            console.log("Data", data)
    });

}

function get_readme_length(repo_base_dir: string): number {
    // Get length in characters of a readme file
    // :param path_to_repo: absolute path to the base directory of the cloned repo
    // :return: number of characters in readme

    let file_contents: string;
    let file: string = path.join(repo_base_dir, "README.md");
    
    try {
        file_contents = fs.readFileSync(file, "ascii");
    } catch(exception) {
        console.log("File not found\n");
        return 0;
    }

    return file_contents?.length;
}

function get_percentage_comments(repo_base_dir: string): number {
    // Get the percentage of code that is comments
    // :param path_to_repo: path to the repo
    // :return: percentage of code that is comments (num_comments / (num_comments + code))

    // Terminal command, running cloc to get comment information
    repo_base_dir = "\"" + repo_base_dir + "\"" // prep directory for cloc command
    let terminal_command: string = "cloc --by-percent cm --sum-one --yaml " + repo_base_dir;

    // Run terminal output and conver to string
    let terminal_output: Buffer = cp.execSync(terminal_command);
    let data: string = terminal_output.toString()

    // Get percentage of repo that is comments
    let percent: number = 0;

    // Get the part of the result after SUM
    let re: RegExp = new RegExp('SUM', 'i')
    data = data.substring(data.search(re), data.length)

    // Get total comment percentage
    re = new RegExp('comment:', 'i');
    let loc: number = data.search(re)
    data = data.substring(loc + "comment: ".length, data.length)
    percent = parseFloat(data.split('\n')[0])
    return percent
}

function delete_repo(repo_base_dir: string) {
    // Delete the repo after analyzing it
    // :param repo_base_dir: base path of repository

    emptyDirSync(repo_base_dir)
    fs.rmdir(repo_base_dir, (err) => {
        if (err)
            console.log(err)
    })
}

function has_license_in_readme(repo_base_dir: string): boolean {
    // Ensure that repo has a license section by checking the README.md
    // :param repo_base_dir: base directory of repo
    // :return: whether readme has license section

    let file_contents: string;
    let file: string = path.join(repo_base_dir, "README.md");
    
    try {
        file_contents = fs.readFileSync(file, "ascii");
    } catch(exception) {
        console.log("File not found\n");
        return false;
    }

    // Search for a license
    let search: RegExp = new RegExp(/#+\s*[Ll][Ii][Cc][Ee][Nn][SsCc][Ee]/)

    return file_contents.search(search) != -1
}

function has_correct_license() {
    // In the future, regex the README to find the specific license we're looking for
    // We should also have a function in another file that uses REST or GraphQL
    // to get supplemental information about licenses
}

async function main() {
    let urls: Array<string> = [
        "https://github.com/cloudinary/cloudinary_npm",
        "https://github.com/expressjs/express",
        "https://github.com/nullivex/nodist",
        "https://github.com/lodash/lodash",
        "https://github.com/browserify/browserify"
    ]

    let path_to_repo: string = "/Users/graysonnocera/Desktop/Spring 2023/ECE 461/ece-461-project/"
    let repo_url: string = urls[0]
    let repo_base_dir: string = path.join(path_to_repo, "cloudinary_npm")
    let git: SimpleGit = create_git_object(path_to_repo, "cloudinary_npm")

    // Clone the repo
    await clone_repo(repo_url, repo_base_dir, git)
    
    // Print readme length in characters and percentage of comments
    console.log(get_readme_length(repo_base_dir))
    console.log(get_percentage_comments(repo_base_dir))
    console.log(has_license_in_readme(repo_base_dir))

    delete_repo(repo_base_dir)
}

main()
