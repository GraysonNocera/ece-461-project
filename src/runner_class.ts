import { listenerCount } from "process";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { get_workingLifetime ,get_recentCommits } from "./parse_links";
import { Package } from './package_class';
import { get_info_from_cloned_repo } from "./clone_repo";
// Rudimentary implementation of Runner class

export class Runner {
  package_instance: Package;

  constructor(instance : Package){
        this.package_instance = instance;
    }
  //What do we need to call from here?  but possibly interact with whatever API's we need 
  //has to be async to allow use of await to fulfil promise made by myFunc
  //Will eventually be used to calculate correctess parameter but currently just used to test API interaction

  async calculate_correctness() {
    //needed to complete promise and return a number type
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

    let num_stars = this.package_instance.num_stars; // Do we want to use the number of stars as a factor in correctness?
    if(num_stars >= 10000){
      num_stars = 1
    } else {
      num_stars /= 10000; 
    }
    this.package_instance.correctness = Math.min( 
      0.2 * num_stars + 
      0.5 * this.package_instance.commit_count +
        0.8 *
          (this.package_instance.issues_active / this.package_instance.issues),
          1);
  }

  //API?
  async calculate_bus() {
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

    // console.log("DEBUG");
    // console.log("DEBUG");
    // console.log("DEBUG");
    // console.log("DEBUG");
    // console.log("DEBUG");
    // console.log(ratio);
    // console.log(num_stars);

    // Calculate bus factor
    this.package_instance.bus_factor = Math.min(7 * ratio + 0.3 * (num_stars / 10000), 1);
    return;
  }

  async calculate_license() {
    // Calculate license based on data from cloned repo
    // License is calculated by considering whether the readme includes a license section
    // and if the repository has a license file
    // NOTE: calculate_license() and calculate_ramp() both need data from the cloned repo
    // I suggest we call it right at the start of the program so it has time to clone the repo
    // while we are doing stuff with REST and GraphQL

    // TODO: should we take into account the REST API license stuff

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

    this.package_instance.license =
      has_license_file_score * 0.2 +
      has_license_in_readme_score * 0.5 +
      has_license_in_package_json * 0.3;
  }

  async calculate_ramp() {
    this.package_instance.ramp_up = 0;


    // await get_info_from_cloned_repo(this.package_instance)

    // Get standards for readme length and percent comments
    let standard_readme_length: number = 10000;
    let standard_percent_comments: number = 0.5;

    // Handle large percent comments

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
  }

  //API?
  async calculate_responsiveness() {
    //this.package_instance.responsiveness = 0;
    this.package_instance.responsiveness = Math.min(this.package_instance.pr_count/1000+ 3*(this.package_instance.commit_count / this.package_instance.total_commits) , 1)
  }

  //API?
  async calculate_score() {
    this.package_instance.score =
      0.35 * this.package_instance.bus_factor +
      0.25 * this.package_instance.license +
      0.2 * this.package_instance.correctness +
      0.1 * this.package_instance.ramp_up +
      0.1 * this.package_instance.responsiveness;

    //whatever we need to do to calculate formula
  }
}
