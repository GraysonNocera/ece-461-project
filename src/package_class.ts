/* Package class module
 * initialized then passed to the APIs to have data loaded to it and then used by the Runner to calculate score
 */
export class Package {
  correctness: number;
  bus_factor: number;
  num_dev: number;
  pr_count: number;
  recent_commit: number;
  total_commits: number;
  last_pushed_at: string;
  num_stars: number;
  readme_size: Promise<number>;
  comment_ratio: Promise<number>;
  ramp_up: number;
  issues: number;
  issues_active: number;
  issue_ratio: number;
  commit_count: number;
  responsiveness: number;
  license: number;
  license_name: string;
  score: number;
  url: string;
  repo: string;
  owner: string;
  token: string;
  last_push: string;
  has_license_in_readme: Promise<boolean>;
  has_license_file: Promise<boolean>;
  has_license_in_package_json: Promise<boolean>;
  has_correct_license_in_readme: Promise<boolean>;

  constructor(URL: string = "", repo = "", owner = "github", token = "") {
    this.correctness = 0;
    this.license_name = "";
    this.bus_factor = 0;
    this.num_dev = 0;
    this.pr_count = 0;
    this.recent_commit = 0;
    this.ramp_up = 0;
    this.issues = 0;
    this.issues_active = 0;
    this.issue_ratio = 0;
    this.commit_count = 0;
    this.readme_size = new Promise<number>((value) => {});
    this.comment_ratio = new Promise<number>((value) => {});
    this.ramp_up = 0;
    this.issues = 0;
    this.issues_active = 0;
    this.issue_ratio = 0;
    this.responsiveness = 0;
    this.license = 0;
    this.num_stars = 0;
    this.total_commits = 0;
    this.last_pushed_at = "";
    this.score = 0;
    this.url = URL;
    this.repo = repo;
    this.owner = owner;
    this.token = token;
    this.last_push = "";
    this.has_license_file = new Promise<boolean>((value) => {});
    this.has_license_in_readme = new Promise<boolean>((value) => {});
    this.has_license_in_package_json = new Promise<boolean>((value) => {});
    this.has_correct_license_in_readme = new Promise<boolean>((value) => {});
  }
}
