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

var ndjson = require('ndjson')

async function main() {
  // Main driver function for calculating score of a package

  let url = process.argv[2];
  var data;
  let log: Logger = provider.getLogger("Main.start");
  if (!url) {
    log.debug("URL not provided when running main program\n");
  }

  log.info("Running command -> node src/main.js " + url);
  log.info("Scoring package from: " + url);

  let username: string | null = null;
  let repoName: string | null = null;
  let gitUrl2: string | null = null;

  log.info("Parsing repository link...\n");

  // Handle the url
  ({
    username: username,
    repoName: repoName,
    url: gitUrl2,
  } = await handle_url(url));

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
      log.debug("Error with graphAPI query: " + error);
    });

    try {
      if (data["message"] == `Bad credentials`) {
        log.debug("Bad credentials. Please check your token.");
      }
    } catch (error) {
      log.debug("GraphQL API call failed with error: " + error);
    }

    log.info("Successful data collection: " + data);

    // fetching metrics to calculate net score
    let run_test = new Runner(package_test);
    log.info("Getting info from cloned repo...");
    await get_info_from_cloned_repo(package_test);
    await get_recentCommits(package_test);
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

    log.info("Correctness " + run_test.package_instance.correctness);
    log.info("Ramp-up " + run_test.package_instance.ramp_up);
    log.info("License Score " + run_test.package_instance.license);
    log.info("Bus Factor " + run_test.package_instance.bus_factor);
    log.info("Responsiveness " + run_test.package_instance.responsiveness);
    log.info("Total Score " + run_test.package_instance.score);

    let retval = {
      "URL": url,
      "NET_SCORE": run_test.package_instance.score,
      "RAMP_UP_SCORE": run_test.package_instance.ramp_up,
      "CORRECTNESS_SCORE": run_test.package_instance.correctness,
      "BUS_FACTOR_SCORE": run_test.package_instance.bus_factor,
      "RESPONSIVE_MAINTAINER_SCORE": run_test.package_instance.responsiveness,
      "LICENSE_SCORE": run_test.package_instance.license,
    };

    console.log((JSON.stringify(retval)));

    return 0;
  } else {
    log.debug(`Unable to fetch repo -> ${username}/${repoName}`);
    return 1;
  }
}

async function handle_url(
  url: string
): Promise<{ username: string; repoName: string; url: string }> {
  // Handle the url provided from url text file
  // :param url: string version of url provided
  // :return: Promise of {username, repoName, url} from parsing url

  let username: string = "";
  let repoName: string = "";
  let gitUrl2: string = url;

  if (url.startsWith("https://www.npmjs.com/package/")) {
    // handling for npm package
    let gitUrl = await npm_2_git(url);
    gitUrl2 = gitUrl.replace("git:", "https:");
    let gitRepoDetails = await getGitRepoDetails(gitUrl);

    if (gitRepoDetails) {
      ({ username, repoName } = gitRepoDetails);
    }
  } else {
    // handling for GitHub package
    gitUrl2 = url;
    let gitRepoDetails = await getGitRepoDetails(url);
    if (gitRepoDetails) {
      ({ username, repoName } = gitRepoDetails);
    }
  }

  return {
    username: username,
    repoName: repoName,
    url: gitUrl2,
  };
}

main();
