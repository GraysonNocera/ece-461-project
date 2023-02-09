import { get_recentCommits } from "./parse_links";
import { Package } from "./package_class";
import { provider } from "./logging";
import { Logger } from "typescript-logging-log4ts-style";

// Main driver for the functions that calculate the score of the repo
export class Runner {
  package_instance: Package;

  constructor(instance: Package) {
    // Constructor for Runner class
    // :param instance: instance of Package class

    this.package_instance = instance;
  }

  async calculate_correctness() {
    // Used to calculate the correctness of the repo
    // Needed to complete promise and return a number type

    let log: Logger = provider.getLogger("Scores.calculate_correctness");

    this.package_instance.commit_count = await get_recentCommits(
      this.package_instance.repo,
      this.package_instance.owner
    );

    // More than 1000 commits in the last year is probably a sign of a well maintained project
    if (this.package_instance.commit_count >= 1000) {
      this.package_instance.commit_count = 1;
    } else {
      this.package_instance.commit_count /= 1000;
    }

    //stars  are also a good sign of a well maintianed repo
    let num_stars = this.package_instance.num_stars;
    if (num_stars >= 10000) {
      num_stars = 1;
    } else {
      num_stars /= 10000;
    }

    log.info(`Calculated num_stars: ${num_stars} and commit_count: ${this.package_instance.commit_count}`)
    log.info("Calculating correctness...")

    //Cap the scores off at 1
    this.package_instance.correctness = Math.min(
      0.2 * num_stars +
        0.5 * this.package_instance.commit_count +
        0.8 *
          (this.package_instance.issues_active / this.package_instance.issues),
      1
    );

    log.info("Calculated correctness score of " + this.package_instance.correctness)
  }

  async calculate_bus() {
    //Calculate the bus factor of the repo

    let log: Logger = provider.getLogger("Scores.calculate_bus");

    let num_devs = this.package_instance.num_dev;
    let pr_count = this.package_instance.pr_count;
    let ratio = 0;

    // If there's no PRs then there's only 1 person working on it
    if (pr_count == 0) {
      this.package_instance.bus_factor = 0; // Terrible bus factor
      return;
    } else {
      ratio = num_devs / pr_count; // Ratio of devs to PRs. If there's a small number of devs making many PRs then the bus factor is low
    }

    let num_stars = this.package_instance.num_stars; // If there's a lot of stars then there's people interested in the project and more likely to contribute

    // console.log(ratio);
    // console.log(num_stars);

    // Calculate bus factor
    this.package_instance.bus_factor = Math.min(
      7 * ratio + 0.3 * (num_stars / 10000),
      1
    );

    log.info("Calculated bus factor score of " + this.package_instance.bus_factor)

    return;
  }

  async calculate_license() {
    // Calculate license based on data from cloned repo

    let log: Logger = provider.getLogger("Scores.calculate_license");

    log.info("Calculating license\n");

    this.package_instance.license = 0;

    let has_license_file_score: number = Number(
      await this.package_instance.has_license_file
    );
    let has_license_in_readme_score: number = Number(
      await this.package_instance.has_license_in_readme
    );
    let has_license_in_package_json: number = Number(
      await this.package_instance.has_license_in_package_json
    );
    let has_correct_license_in_readme: number = Number(
      await this.package_instance.has_correct_license_in_readme
    );

    // License score outputs a 1 if at least one of the following are true:
    // 1) The readme has a compatible license
    // 2) The repo has a license file, and has a license field in package.json, and has a license
    //    header in the readme
    this.package_instance.license =
      has_correct_license_in_readme ||
      (has_license_file_score &&
        has_license_in_readme_score &&
        has_license_in_package_json);

    if (has_correct_license_in_readme) {
      log.info(
        "License score is 1 based on condition (1) (check function for more information)\n"
      );
    } else if (
      has_license_file_score &&
      has_license_in_readme_score &&
      has_license_in_package_json
    ) {
      log.info(
        "License score is 1 based on condition (2) (check function for more information)\n"
      );
    } else {
      log.info("License score is 0\n");
    }
  }

  async calculate_ramp() {
    // Calculate the ramp up time of a large package

    let log: Logger = provider.getLogger("Scores.calculate_ramp");

    log.info("Calculate ramp up time");

    this.package_instance.ramp_up = 0;

    // Get standards for readme length and percent comments
    let standard_readme_length: number = 10000;
    let standard_percent_comments: number = 0.5;

    // Subscores
    let readme_score = Math.min(
      (await this.package_instance.readme_size) / standard_readme_length,
      1
    );
    let comments_score = Math.min(
      (await this.package_instance.comment_ratio) / standard_percent_comments,
      1
    );

    // Calculate ramp up time
    this.package_instance.ramp_up = readme_score * 0.4 + comments_score * 0.6;

    log.info("Calculated ramp up score of " + this.package_instance.ramp_up)
  }

  //calculate responsiveness
  async calculate_responsiveness() {
    // Calculate responsiveness

    let log: Logger = provider.getLogger("Scores.calculate_responsiveness");

    log.info("Calculating responsiveness");
    this.package_instance.responsiveness = Math.min(
      this.package_instance.pr_count / 1000 +
        3 *
          (this.package_instance.commit_count /
            this.package_instance.total_commits),
      1
    );

    log.info("Calculated responsiveness of " + this.package_instance.responsiveness)
  }

  //calculate total score
  async calculate_score() {
    let log: Logger = provider.getLogger("Scores.calculate_score");
    log.info("Calculating final score...");

    this.package_instance.score =
      0.35 * this.package_instance.bus_factor +
      0.25 * this.package_instance.license +
      0.2 * this.package_instance.correctness +
      0.1 * this.package_instance.ramp_up +
      0.1 * this.package_instance.responsiveness;

    log.info(
      "Final score for package " +
        this.package_instance.repo +
        " = " +
        this.package_instance.score
    );
  }

  write_to_file() {
    // In reality, we should keep track of all these values in the CLI probably, then do the sorting, followed by
    // a loop that does this over and over, putting it all into the output file

    this.package_instance.url = "https://github.com/lodash/lodash";
    let json: string = JSON.stringify({
      URL: this.package_instance.url,
      NET_SCORE: 0.8,
      RAMP_UP_SCORE: 0.4,
      CORRECTNESS_SCORE: 0.2,
      BUS_FACTOR_SCORE: 0.45,
      RESPONSIVE_MAINTAINER_SCORE: 0.6,
      LICENSE_SCORE: 1,
    });

    json += "\n";

    this.package_instance.url = "https://github.com/nullivex/nodist";
    json += JSON.stringify({
      URL: this.package_instance.url,
      NET_SCORE: 0.2,
      RAMP_UP_SCORE: 0.5,
      CORRECTNESS_SCORE: 0.8,
      BUS_FACTOR_SCORE: 0.2,
      RESPONSIVE_MAINTAINER_SCORE: 0.9,
      LICENSE_SCORE: 0,
    });

    console.log(json);
  }
}
