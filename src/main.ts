import {
  npm_2_git,
  getGitRepoDetails,
  graphAPIfetch,
  gql_query,
} from "./parse_links";

import { Package } from "./package_class";
import { Runner } from "./runner_class";
import { get_info_from_cloned_repo } from "./clone_repo";
import { provider } from "./logging";
import { Logger } from "typescript-logging-log4ts-style";

function sleep(ms: number) {
  // On the one hand, don't use it. On the other, I spent 3 hours (no joke) debugging
  // a race condition that could have been fixed with ```await sleep(500)```.
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  let url = process.argv[2];
  var data;
  let log: Logger = provider.getLogger("Main.start");
  if (!url) {
    throw new Error(
      "Please provide a URL as an argument when running the program."
    );
  }

  let username: string | null = null;
  let repoName: string | null = null;
  let gitUrl2: string | null = null;

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
    console.log(gitUrl2);
    let package_test = new Package(
      gitUrl2,
      repoName,
      username,
      process.env.GITHUB_TOKEN
    );
    data = await graphAPIfetch(
      gql_query(username, repoName),
      package_test
    ).catch((error) => {
      log.debug("Error with graphAPI query");
    });

    log.info("successful data collection");

    if (data["message"] == `Bad credentials`) {
      console.log(`Bad credentials. Please check your token.`);
      throw new Error("Bad credentials. Please check your token.");
    }

    let run_test = new Runner(package_test);
    await get_info_from_cloned_repo(package_test);
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

    // console.log("Correctness " + run_test.package_instance.correctness);
    // console.log("Ramp-up " + run_test.package_instance.ramp_up);
    // console.log("License Score " + run_test.package_instance.license);
    // console.log("Bus Factor " + run_test.package_instance.bus_factor);
    // console.log("Responsiveness " + run_test.package_instance.responsiveness);
    // console.log("Total Score " + run_test.package_instance.score);
  } else {
    throw new Error(`Unable to fetch repo -> ${username}/${repoName}`);
  }
}

main();
