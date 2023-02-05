// File for functions to get information from cloned repo
import fs from "fs";
import path from "path";
import cp from "child_process";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { emptyDir, emptyDirSync } from "fs-extra";
import { Package } from "./package_class";
import { root_cloned } from "./logging";
import { Category } from "typescript-logging-category-style";

export async function create_git_object(repo_name: string, path_to_repo?: string): Promise<SimpleGit> {
    // Clone repo into path_to_repo + repo_name directory
    // :param repo_url: url to Github repo page
    // :param path_to_repo: (optional) path to repository
    // :param repo_name: (optional) name of repository

    let log: Category = root_cloned.getChildCategory("create_git_object")

    if (!path_to_repo) {
        // If no path_to_repo provided, assume current working directory
        path_to_repo = process.cwd()
    }

    // Create file or delete its contents if it exists
    let repo_base_dir = path.join(path_to_repo, repo_name)
    if (!fs.existsSync(repo_base_dir)) {
        fs.mkdirSync(repo_base_dir)
        log.info("Created repository directory\n")
    } else {
        emptyDirSync(repo_base_dir)
        log.info("Emptied repository directory\n")
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

    if (git) {
        log.info("Successfully created git object\n")
    } else {
        log.debug("Git object was not properly created\n")
    }

    return git
}

export async function clone_repo(repo_url: string, repo_base_dir: string, git: SimpleGit): Promise<void> {

    let log: Category = root_cloned.getChildCategory("clone_repo")

    emptyDirSync(repo_base_dir)

    // Clone repo
    await git.clone(repo_url, repo_base_dir, {
        //Options go here
    }, (err, data) => {
        if (err)
            log.debug("Error when cloning from " + repo_url + ": " + err + "\n")
        if (data)
            log.info("Data from cloning from " + repo_url + "\n")
    });

}

async function get_readme_path(repo_base_dir: string): Promise<string> {
    // Get the path of a readme in a repo
    // :param repo_base_dir: base directory of repo
    // :return: string of repo readme 

    let log: Category = root_cloned.getChildCategory("get_readme_path")

    let file_path: string = "";
    
    // match readme
    let readme_search: RegExp = /[Rr][Ee][Aa][Dd][Mm][Ee]\..+/
    let files: string[] = fs.readdirSync(repo_base_dir)
    files.forEach(element => {
        if (element.search(readme_search) != -1) {
            file_path = path.join(repo_base_dir, element)
            log.info("Found readme file for repository: " + file_path + "\n")
            return file_path
        }
    });
    
    if (!file_path) {
        log.debug("Readme file not found for repository in " + repo_base_dir + "\n")
    }

    return file_path
}

export async function has_license_file(repo_base_dir: string): Promise<boolean> {
    // Boolean for detecting a license file
    // :param repo_base_dir: base directory of repo
    // :return: whether the repo has a license file

    let log: Category = root_cloned.getChildCategory("has_license_file")    

    let has_file: boolean = false;
    
    // match readme
    let readme_search: RegExp = /[Ll][Ii][Cc][Ee][Nn][SsCc][Ee]\.*.*/
    let files: string[] = fs.readdirSync(repo_base_dir)
    files.forEach(element => {
        if (element.search(readme_search) != -1) {
            has_file = true
            return has_file
        }
    });

    if (has_file) {
        log.info("License file found for repository in " + repo_base_dir + "\n")
    } else {
        log.info("License file not found for repository in " + repo_base_dir + "\n")
    }

    return has_file
}

export async function get_readme_length(repo_base_dir: string): Promise<number> {
    // Get length in characters of a readme file
    // :param path_to_repo: absolute path to the base directory of the cloned repo
    // :return: number of characters in readme

    let file_path = await get_readme_path(repo_base_dir)

    if (!file_path) {
        return 0;
    }

    let file_contents: string = await read_readme(file_path);

    if (!file_contents) {
        return 0;
    }

    return file_contents.length;
}

export async function get_percentage_comments(repo_base_dir: string): Promise<number> {
    // Get the percentage of code that is comments
    // :param path_to_repo: path to the repo
    // :return: percentage of code that is comments (num_comments / (num_comments + code))

    let log: Category = root_cloned.getChildCategory("get_percentage_comments")    

    // Terminal command, running cloc to get comment information
    repo_base_dir = "\"" + repo_base_dir + "\"" // prep directory for cloc command
    let terminal_command: string = "cloc --by-percent cm --sum-one --yaml " + repo_base_dir;

    // Run terminal output and conver to string
    let terminal_output: Buffer;
    try {
        terminal_output = cp.execSync(terminal_command)
    } catch (err) {
        log.debug("Error in running cloc command\n")
        return 0;
    }
    let data: string = terminal_output.toString()

    // Get percentage of repo that is comments
    let percent: number = 0;

    // Get the part of the result after SUM
    let re: RegExp = new RegExp('SUM', 'i')
    data = data.substring(data.search(re), data.length)

    // Get total comment percentage
    re = new RegExp('comment:', 'i');
    let loc: number = data.search(re)
    if (!loc) {
        log.debug("Could not find comment ratio\n")
        return 0
    }

    data = data.substring(loc + "comment: ".length, data.length)
    percent = parseFloat(data.split('\n')[0])

    log.info("Returning comment ratio\n")

    return percent
}

export async function delete_repo(repo_base_dir: string): Promise<void> {
    // Delete the repo after analyzing it
    // :param repo_base_dir: base path of repository

    let log: Category = root_cloned.getChildCategory("delete_repo")    

    if (fs.existsSync(repo_base_dir)) {
        await emptyDir(repo_base_dir)
        fs.rmdir(repo_base_dir, (err) => {
            if (err)
                log.debug("Error when removing repository in " + repo_base_dir + "\n")
        })
    }
}

export async function has_license_in_readme(repo_base_dir: string): Promise<boolean> {
    // Ensure that repo has a license section by checking the README.md
    // :param repo_base_dir: base directory of repo
    // :return: whether readme has license section


    let file_path: string = await get_readme_path(repo_base_dir);

    if (!file_path)
        return false

    let file_contents: string = await read_readme(file_path);

    if (!file_contents)
        return false

    // Search for a license
    let search: RegExp = new RegExp(/#+\s*[Ll][Ii][Cc][Ee][Nn][SsCc][Ee]/)

    return file_contents.search(search) != -1
}

async function read_readme(readme_path: string): Promise<string> {

    let log: Category = root_cloned.getChildCategory("read_readme")    

    let file_contents: string = "";
    
    try {
        file_contents = fs.readFileSync(readme_path, "ascii");
    } catch(exception) {
        log.debug("Readme file not found: " + readme_path + "\n")
    }

    return file_contents;
}

export async function has_license_in_package_json(repo_base_dir: string): Promise<boolean> {

    let log: Category = root_cloned.getChildCategory("has_license_in_package_json")    

    let package_json_path: string = path.join(repo_base_dir, "package.json")
    let file_contents: Buffer;
    try {
        file_contents = fs.readFileSync(package_json_path)
    } catch (err) {
        log.debug("Could not find package.json file\n")
        return false
    }

    let package_json = JSON.parse(file_contents.toString())
    try {
        if (package_json.license)
            log.info("Found license in package.json\n")
            return true
    } catch(err) {
        log.debug("Package.json has no license\n")
        return false
    }

    return true
}

function has_correct_license() {
    // In the future, regex the README to find the specific license we're looking for
    // We should also have a function in another file that uses REST or GraphQL
    // to get supplemental information about licenses
}

export async function get_info_from_cloned_repo(package_instance: Package) {
    // Get information from cloned repo and save it in package_instance
    // :param package_instance: instance of package class holding data
    // :return: none

    let path_to_repo: string = process.cwd()
    let repo_base_dir: string = path.join(path_to_repo, package_instance.repo)
    let git: SimpleGit = await create_git_object(package_instance.repo, path_to_repo)

    await clone_repo(package_instance.url, repo_base_dir, git)

    // Get information about readme
    package_instance.readme_size = get_readme_length(repo_base_dir)
    package_instance.comment_ratio = get_percentage_comments(repo_base_dir)
    package_instance.has_license_in_readme = has_license_in_readme(repo_base_dir)
    package_instance.has_license_file = has_license_file(repo_base_dir)
    package_instance.has_license_in_package_json = has_license_in_package_json(repo_base_dir)

    delete_repo(repo_base_dir)
}

let p: Package = new Package()
p.repo = "cloudinary_npm"
p.url = "https://github.com/cloudinary/cloudinary_npm"
get_info_from_cloned_repo(p)