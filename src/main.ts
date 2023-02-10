import {
  npm_2_git,
  getGitRepoDetails,
  graphAPIfetch,
  gql_query,
} from "./parse_links";

import { Package } from "./package_class";
import { Runner } from "./runner_class";
import { get_info_from_cloned_repo } from "./clone_repo";
import { get_recentCommits } from "./parse_links";
import { provider } from "./logging";
import { Logger } from "typescript-logging-log4ts-style";

async function main() {
  let url = process.argv[2];
  var data;
  let log: Logger = provider.getLogger("Main.start");
  if (!url) {
    log.debug("URL not provided when running main program\n");
  }

  log.info("Scoring package from: " + url);

  let username: string | null = null;
  let repoName: string | null = null;
  let gitUrl2: string | null = null;

  log.info("Parsing repository link...\n");
  if (url.startsWith("https://www.npmjs.com/package/")) {
    let gitUrl = await npm_2_git(url);
    gitUrl2 = gitUrl.replace("git:", "https:");
    let gitRepoDetails = await getGitRepoDetails(gitUrl);

    if (gitRepoDetails) {
      ({ username, repoName } = gitRepoDetails);
    }
  } else {
    gitUrl2 = url;
    let gitRepoDetails = await getGitRepoDetails(url);
    if (gitRepoDetails) {
      ({ username, repoName } = gitRepoDetails);
    }
  }

  if (username != null && repoName != null && gitUrl2 != null) {
    let package_test = new Package(
      gitUrl2,
      repoName,
      username,
      process.env.GITHUB_TOKEN
    );

    log.info("Getting info from graphQL query");
    data = await graphAPIfetch(
      gql_query(username, repoName),
      package_test
    ).catch((error) => {
      log.debug("Error with graphAPI query");
    });

    log.info("successful data collection");

    if (data["message"] == `Bad credentials`) {
      log.debug("Bad credentials. Please check your token.");
    }

    let run_test = new Runner(package_test);
    log.info("Getting info from cloned repo...");
    await get_info_from_cloned_repo(package_test);
    await get_recentCommits(package_test.repo, package_test.owner);
    await run_test.calculate_correctness();
    log.info("calculating correctness");
    await run_test.calculate_responsiveness();
    log.info("calculating responsiveness");
    await run_test.calculate_ramp();
    log.info("calculating ramp-up");
    await run_test.calculate_license();
    log.info("calculating license");
    await run_test.calculate_bus();
    log.info("calculating bus factor");
    await run_test.calculate_score();
    log.info("calculating final score");

    console.log("Correctness " + run_test.package_instance.correctness);
    console.log("Ramp-up " + run_test.package_instance.ramp_up);
    console.log("License Score " + run_test.package_instance.license);
    console.log("Bus Factor " + run_test.package_instance.bus_factor);
    console.log("Responsiveness " + run_test.package_instance.responsiveness);
    console.log("Total Score " + run_test.package_instance.score);
  } else {
    log.debug(`Unable to fetch repo -> ${username}/${repoName}`);
  }
}

main();
