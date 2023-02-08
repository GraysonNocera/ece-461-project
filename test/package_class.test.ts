import { isExportDeclaration } from "typescript";
import { Package } from "../src/package_class";

describe("test initializing Package", () => {
  test("initialize left empty", () => {
    let test = new Package();
    expect(test.bus_factor).toBe(0);
    expect(test.correctness).toBe(0);
    expect(test.license_name).toBe("");
    expect(test.num_dev).toBe(0);
    expect(test.pr_count).toBe(0);
    expect(test.recent_commit).toBe(0);
    expect(test.ramp_up).toBe(0);
    expect(test.issues).toBe(0);
    expect(test.issues_active).toBe(0);
    expect(test.issue_ratio).toBe(0);
    expect(test.commit_count).toBe(0);
    expect(test.ramp_up).toBe(0);
    expect(test.responsiveness).toBe(0);
    expect(test.license).toBe(0);
    expect(test.num_stars).toBe(0);
    expect(test.total_commits).toBe(0);
    expect(test.last_pushed_at).toBe("");
    expect(test.score).toBe(0);
    expect(test.url).toBe("");
    expect(test.repo).toBe("");
    expect(test.owner).toBe("github");
    expect(test.token).toBe("");
    expect(test.last_push).toBe("");
  });

  test("initialize dummy url and val", () => {
    let test = new Package(
      "http://useless_github.com",
      "test_repo",
      "your_mom"
    );
    expect(test.bus_factor).toBe(0);
    expect(test.correctness).toBe(0);
    expect(test.license_name).toBe("");
    expect(test.num_dev).toBe(0);
    expect(test.pr_count).toBe(0);
    expect(test.recent_commit).toBe(0);
    expect(test.ramp_up).toBe(0);
    expect(test.issues).toBe(0);
    expect(test.issues_active).toBe(0);
    expect(test.issue_ratio).toBe(0);
    expect(test.commit_count).toBe(0);
    expect(test.ramp_up).toBe(0);
    expect(test.responsiveness).toBe(0);
    expect(test.license).toBe(0);
    expect(test.num_stars).toBe(0);
    expect(test.total_commits).toBe(0);
    expect(test.last_pushed_at).toBe("");
    expect(test.score).toBe(0);
    expect(test.url).toBe("http://useless_github.com");
    expect(test.repo).toBe("test_repo");
    expect(test.owner).toBe("your_mom");
    expect(test.token).toBe("");
    expect(test.last_push).toBe("");
  });

  test("initialize dummy url and val but no owner", () => {
    let test = new Package("http://useless_github.com", "test_repo");
    expect(test.bus_factor).toBe(0);
    expect(test.correctness).toBe(0);
    expect(test.license_name).toBe("");
    expect(test.num_dev).toBe(0);
    expect(test.pr_count).toBe(0);
    expect(test.recent_commit).toBe(0);
    expect(test.ramp_up).toBe(0);
    expect(test.issues).toBe(0);
    expect(test.issues_active).toBe(0);
    expect(test.issue_ratio).toBe(0);
    expect(test.commit_count).toBe(0);
    expect(test.ramp_up).toBe(0);
    expect(test.responsiveness).toBe(0);
    expect(test.license).toBe(0);
    expect(test.num_stars).toBe(0);
    expect(test.total_commits).toBe(0);
    expect(test.last_pushed_at).toBe("");
    expect(test.score).toBe(0);
    expect(test.url).toBe("http://useless_github.com");
    expect(test.repo).toBe("test_repo");
    expect(test.owner).toBe("github");
    expect(test.token).toBe("");
    expect(test.last_push).toBe("");
  });
});
