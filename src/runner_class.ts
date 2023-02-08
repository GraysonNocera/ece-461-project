import { listenerCount } from "process";
import { get_issues } from "./correctness";
import { Package } from './package_class';
import { get_info_from_cloned_repo } from "./clone_repo";
// Rudimentary implementation of Runner class

export class Runner {
 package_instance: Package; 
  // correctness:number;
  // bus_factor:number;
  // ramp_up:number;
  // issues:number;
  // responsiveness:number;
  // license:number;
  // score: number;
  // url:string;
  // repo:string; 
  // owner:string; 
    constructor(instance : Package){
        this.package_instance = instance;
    }
  // constructor(URL: string = "", repo = "", owner = "github") {
  //     this.url = URL;
  //     this.correctness = 0;
  //     this.bus_factor = 0; 
  //     this.ramp_up = 0;
  //     this.issues = 0;
  //     this.responsiveness = 0;
  //     this.license = 0; 
  //     this.score = 0; 
  //     this.repo = repo; 
  //     this.owner = owner; 
  // }

  //What do we need to call from here?  but possibly interact with whatever API's we need 
  //has to be async to allow use of await to fulfil promise made by myFunc
  //Will eventually be used to calculate correctess parameter but currently just used to test API interaction
  async calculate_correctness(){
    this.package_instance.correctness = 0; 

    //needed to complete promise and return a number type 
    this.package_instance.issues = await get_issues(this.package_instance.repo, this.package_instance.owner);
}

  //API?
  async calculate_bus(){
    this.package_instance.bus_factor = 0; 
  }

  async calculate_license(){
    // Calculate license based on data from cloned repo
    // License is calculated by considering whether the readme includes a license section
    // and if the repository has a license file
    // NOTE: calculate_license() and calculate_ramp() both need data from the cloned repo
    // I suggest we call it right at the start of the program so it has time to clone the repo
    // while we are doing stuff with REST and GraphQL

    // TODO: should we take into account the REST API license stuff

    this.package_instance.license = 0

    let has_license_file_score: number = Number(await this.package_instance.has_license_file)
    let has_license_in_readme_score: number = Number(await this.package_instance.has_license_in_readme)
    let has_license_in_package_json: number = Number(await this.package_instance.has_license_in_package_json)

    this.package_instance.license = has_license_file_score * 0.2 + has_license_in_readme_score * 0.5 + has_license_in_package_json * 0.3
  }

  async calculate_ramp(){

    this.package_instance.ramp_up = 0

    await get_info_from_cloned_repo(this.package_instance)

    // Get standards for readme length and percent comments
    let standard_readme_length: number = 10000;
    let standard_percent_comments: number = 0.5;

    // Handle large percent comments

    // Subscores
    let readme_score = Math.min(await this.package_instance.readme_size / standard_readme_length, 1)
    let comments_score = Math.min(await this.package_instance.comment_ratio / standard_percent_comments, 1)

    // Calculate ramp up time
    this.package_instance.ramp_up = (readme_score * 0.4) + (comments_score * 0.6)
  }

  //API? 
  async claculate_responsiveness(){
    this.package_instance.responsiveness = 0; 
  }

  //API?
  async calculate_score(){
    this.package_instance.score = 0.35 * this.package_instance.bus_factor + 0.25 * this.package_instance.license + 0.2 * this.package_instance.correctness + 0.1 * this.package_instance.ramp_up + 0.1 * this.package_instance.responsiveness;
    
    //whatever we need to do to calculate formula 
  }

  write_to_file() {
    // In reality, we should keep track of all these values in the CLI probably, then do the sorting, followed by
    // a loop that does this over and over, putting it all into the output file

    this.package_instance.url = "https://github.com/lodash/lodash"
    let json: string = JSON.stringify({
      "URL":this.package_instance.url,
      "NET_SCORE":0.8,
      "RAMP_UP_SCORE":0.4,
      "CORRECTNESS_SCORE": 0.2,
      "BUS_FACTOR_SCORE": 0.45,
      "RESPONSIVE_MAINTAINER_SCORE": 0.6,
      "LICENSE_SCORE": 1,
    })

    json += "\n"

    this.package_instance.url = "https://github.com/nullivex/nodist"
    json += JSON.stringify({
      "URL":this.package_instance.url,
      "NET_SCORE":0.2,
      "RAMP_UP_SCORE":0.5,
      "CORRECTNESS_SCORE": 0.8,
      "BUS_FACTOR_SCORE": 0.2,
      "RESPONSIVE_MAINTAINER_SCORE": 0.9,
      "LICENSE_SCORE": 0,
    })

    console.log(json)
  }
}

let run = new Runner(new Package())
run.write_to_file()

