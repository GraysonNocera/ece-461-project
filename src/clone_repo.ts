// File for functions to get information from cloned repo
import * as fs from "fs";
import * as path from "path";
import * as cp from "child_process";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { emptyDirSync } from "fs-extra";
import { Package } from "./package_class";
import { provider } from "./logging";
import { Logger } from "typescript-logging-log4ts-style";

async function create_git_object(
  repo_name: string,
  path_to_repo?: string
): Promise<SimpleGit> {
  // Create git object
  // :param path_to_repo: (optional) path to repository
  // :param repo_name: (optional) name of repository
  // :return: Promise of a SimpleGit object to interact with repo

  let log: Logger = provider.getLogger("Cloned.create_git_object");

  if (!path_to_repo) {
    // If no path_to_repo provided, assume current working directory
    path_to_repo = process.cwd();
  }

  // Create file or delete its contents if it exists
  let repo_base_dir = path.join(path_to_repo, repo_name);
  if (!fs.existsSync(repo_base_dir)) {
    fs.mkdirSync(repo_base_dir);
    log.info("Created repository directory\n");
  } else {
    emptyDirSync(repo_base_dir);
    log.info("Emptied existing repository directory\n");
  }

  // Create options for git object
  const options: Partial<SimpleGitOptions> = {
    baseDir: repo_base_dir,
    binary: "git",
    maxConcurrentProcesses: 6,
    trimmed: false,
  };

  // Create git object
  const git: SimpleGit = simpleGit(options);

  if (git) {
    log.info("Successfully created git object\n");
  } else {
    log.debug("Git object was not properly created\n");
  }

  return git;
}

async function clone_repo(
  repo_url: string,
  repo_base_dir: string,
  git: SimpleGit
): Promise<void> {
  // Clone repo into path_to_repo + repo_name directory
  // :param repo_url: GitHub repository url
  // :param repo_base_dir: base directory of repository on local machine
  // :param git: git object for interacting with repository
  // :return: none

  let log: Logger = provider.getLogger("Cloned.clone_repo");

  emptyDirSync(repo_base_dir);

  log.info("Cloning repo...");

  // Clone repo
  await git.clone(
    repo_url,
    repo_base_dir,
    {
      //Options go here
    },
    (err, data) => {
      if (err)
        log.debug("Error when cloning from " + repo_url + ": " + err + "\n");
      if (data) log.info("Data from cloning from " + repo_url + "\n");
    }
  );

  log.info("Successfully cloned repo");
}

function get_readme_path(repo_base_dir: string): string {
  // Get the path of a readme in a repo
  // :param repo_base_dir: base directory of repo
  // :return: string of repo readme

  let log: Logger = provider.getLogger("Cloned.get_readme_path");

  let file_path: string = "";

  // match readme
  let readme_search: RegExp = /[Rr][Ee][Aa][Dd][Mm][Ee]\..+/;
  let files: string[] = fs.readdirSync(repo_base_dir);
  files.forEach((element) => {
    if (element.search(readme_search) != -1) {
      file_path = path.join(repo_base_dir, element);
      log.info("Found readme file for repository: " + file_path + "\n");
      return file_path;
    }
  });

  if (!file_path) {
    log.debug(
      "Readme file not found for repository in " + repo_base_dir + "\n"
    );
  }

  return file_path;
}

async function has_license_file(repo_base_dir: string): Promise<boolean> {
  // Boolean for detecting a license file
  // :param repo_base_dir: base directory of repo
  // :return: Promise of whether the repo has a license file

  let log: Logger = provider.getLogger("Cloned.has_license_file");

  let has_file: boolean = false;

  // match readme
  let readme_search: RegExp = /[Ll][Ii][Cc][Ee][Nn][SsCc][Ee]\.*.*/;
  let files: string[] = fs.readdirSync(repo_base_dir);
  files.forEach((element) => {
    if (element.search(readme_search) != -1) {
      log.info("License file found for respoitory: " + element + "\n");
      has_file = true;
      return has_file;
    }
  });

  log.info("License file not found for repository in " + repo_base_dir + "\n");

  return has_file;
}

async function get_readme_length(
  file_contents: Promise<string>
): Promise<number> {
  // Get length in characters of a readme file
  // :param file_contents: Contents of readme in a string
  // :return: Promise of number of characters in readme

  return (await file_contents)?.length;
}

async function get_percentage_comments(repo_base_dir: string): Promise<number> {
  // Get the percentage of code that is comments
  // :param repo_base_dir: base directory of repository
  // :return: Promise of percentage of code that is comments (num_comments / (num_comments + code))

  let log: Logger = provider.getLogger("Cloned.get_percentage_comments");

  // Terminal command, running cloc to get comment information
  log.info("Running cloc on cloned repository\n");
  repo_base_dir = '"' + repo_base_dir + '"'; // prep directory for cloc command
  let terminal_command: string =
    "cloc --by-percent cm --sum-one --yaml " + repo_base_dir;

  // Run terminal output and convert to string
  let terminal_output: Buffer;
  try {
    terminal_output = cp.execSync(terminal_command);
  } catch (err) {
    log.debug("Error in running cloc command\n");
    return 0;
  }
  let data: string = terminal_output.toString();

  // Get percentage of repo that is comments
  let percent: number = 0;

  // Get the part of the result after SUM
  let re: RegExp = new RegExp("SUM", "i");
  data = data.substring(data.search(re), data.length);

  // Get total comment percentage
  re = new RegExp("comment:", "i");
  let loc: number = data.search(re);
  if (!loc) {
    log.debug("Could not find comment ratio\n");
    return 0;
  }

  data = data.substring(loc + "comment: ".length, data.length);
  percent = parseFloat(data.split("\n")[0]);

  log.info("Returning comment ratio: " + percent + "\n");

  return percent;
}

async function delete_repo(repo_base_dir: string): Promise<void> {
  // Delete the repo after analyzing it
  // :param repo_base_dir: base path of repository
  // :return: none

  let log: Logger = provider.getLogger("Cloned.get_repo");

  log.info("Removing repository\n");
  if (fs.existsSync(repo_base_dir)) {
    fs.rm(repo_base_dir, { recursive: true }, (err) => {
      if (err)
        log.debug("Error when removing repository in " + repo_base_dir + "\n");
    });
  }
}

async function has_license_in_readme(
  file_contents: Promise<string>
): Promise<boolean> {
  // DEPRECATED FUNCTION
  // Ensure that repo has a license section by checking the README.md
  // :param file_contents: File contents of readme
  // :return: Promise of whether readme has license section

  // Search for a license
  let search: RegExp = new RegExp(/#+\s*[Ll][Ii][Cc][Ee][Nn][SsCc][Ee]/);

  return (await file_contents)?.search(search) != -1;
}

async function read_readme(readme_path: string): Promise<string> {
  // Read contents of readme
  // :param readme_path: local path to readme
  // :return: Promise of string contents of readme

  let log: Logger = provider.getLogger("Cloned.read_readme");

  let file_contents: string = "";

  log.info("Reading contents of Readme\n");
  try {
    file_contents = fs.readFileSync(readme_path, "ascii");
  } catch (exception) {
    log.debug("Readme file not found: " + readme_path + "\n");
  }

  return file_contents;
}

async function has_license_in_package_json(
  repo_base_dir: string
): Promise<boolean> {
  // Test if the repository has a license in its package.json
  // :param repo_base_dir: Base directory of repository
  // :return: Promise of whether the license is in the package.json

  let log: Logger = provider.getLogger("Cloned.has_license_in_package_json");

  let package_json_path: string = path.join(repo_base_dir, "package.json");
  let file_contents: Buffer;
  try {
    log.info("Read package.json file\n");
    file_contents = fs.readFileSync(package_json_path);
  } catch (err) {
    log.debug(
      "Could not find package.json file, exited with error: " + err + "\n"
    );
    return false;
  }

  let package_json = JSON.parse(file_contents.toString());
  try {
    if (package_json.license) log.info("Found license in package.json\n");
    return true;
  } catch (err) {
    log.debug("Package.json has no license, exited with error: " + err + "\n");
    return false;
  }
}

async function has_correct_license_in_readme(
  file_contents: Promise<string>
): Promise<boolean> {
  // Search through README for correct license in README
  // :param file_contents: Promise of file contents of readme
  // :return: Promise of whether the readme has a compatible license

  let log: Logger = provider.getLogger("Cloned.has_correct_license_in_readme");
  let match: number = -1;

  // Licenses to search for
  let searches: Array<RegExp> = [
    /\s*[Ll]+(esser\s)*[Gg]+(eneral\s)*[Pp]+(ublic\s)*[Ll]+(icense\s|icence\s)*\s*[Vv]+(ersion)*(\s)*(2\.[1-9]|3(\.[1-9])*)+[^A-Za-z]+/,
    /\s*[Mm]+[Ii]+[Tt]+[^A-Za-z]+/,
    /\s*[Bb]+[Ss]+[Dd]+[^A-Za-z]+/,
    /\s*[Aa](pache|PACHE)+[^A-Za-z]+/,
    /\s*[Mm]+[Pp]+[Ll]+[^A-Za-z]+/,
  ];

  // Define licenses for ease of printing in log file
  let licenses: Array<string> = ["LGPL", "MIT", "BSD", "Apache", "MPL"];

  // Iterate through licenses to check
  for (let i: number = 0; i < searches.length; i++) {
    match = (await file_contents)?.search(searches[i]);
    if (match != -1) {
      log.info("Found license " + licenses[i] + " in readme\n");
      return true;
    }
  }

  log.info("Could not find license in readme\n");

  return false;
}

async function get_info_from_cloned_repo(package_instance: Package) {
  // Get information from cloned repo and save it in package_instance
  // :param package_instance: instance of package class holding data
  // :return: none

  let log: Logger = provider.getLogger("Cloned.get_info_from_cloned_repo");

  log.info("Cloning repo and getting information about it\n");

  // Create git object to interact with repo
  let path_to_repo: string = process.cwd();
  let repo_base_dir: string = path.join(path_to_repo, package_instance.repo);
  let git: SimpleGit = await create_git_object(
    package_instance.repo,
    path_to_repo
  );

  // Clone the repo and wait for it to be done
  await clone_repo(package_instance.url, repo_base_dir, git);

  // Get README path and contents
  let file_path: string = get_readme_path(repo_base_dir);
  let file_contents: Promise<string> = read_readme(file_path);

  // Get information about repo
  package_instance.comment_ratio = get_percentage_comments(repo_base_dir);
  package_instance.has_license_file = has_license_file(repo_base_dir);
  package_instance.has_license_in_package_json =
    has_license_in_package_json(repo_base_dir);

  if (!file_path) {
    // If readme is not found, nothing can be obtained from it
    package_instance.readme_size = Promise.resolve(0);
    package_instance.has_license_in_readme = Promise.resolve(false);
    package_instance.has_correct_license_in_readme = Promise.resolve(false);

    delete_repo(repo_base_dir);
    return;
  }

  if (!(await file_contents)) {
    // If readme contents are not found, nothing can be obtained from it
    package_instance.readme_size = Promise.resolve(0);
    package_instance.has_license_in_readme = Promise.resolve(false);
    package_instance.has_correct_license_in_readme = Promise.resolve(false);

    delete_repo(repo_base_dir);
    return;
  }

  // Get readme length, readme license
  package_instance.readme_size = get_readme_length(file_contents);
  package_instance.has_license_in_readme = has_license_in_readme(file_contents);
  package_instance.has_correct_license_in_readme =
    has_correct_license_in_readme(file_contents);

  // Delete the repo
  delete_repo(repo_base_dir);
  return;
}

// Export functions
export {
  get_info_from_cloned_repo,
  has_correct_license_in_readme,
  has_license_in_package_json,
  read_readme,
  has_license_in_readme,
  delete_repo,
  get_percentage_comments,
  get_readme_length,
  has_license_file,
  get_readme_path,
  clone_repo,
  create_git_object,
};
