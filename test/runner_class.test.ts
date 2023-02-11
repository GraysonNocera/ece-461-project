import { Package } from "../src/package_class";
import { Runner } from "../src/runner_class";

jest.setTimeout(30 * 1000)

const test_package = new Package(
  "https.dummy_url.gov",
  "dummy_repo",
  "test123"
);

describe("testing for Runner class", () => {
  beforeEach(() => {
    test_package.commit_count = 0;
    test_package.num_dev = 0;
    test_package.correctness = 0;
    test_package.bus_factor = 0;
    test_package.pr_count = 0;
    test_package.num_stars = 0;
    test_package.has_license_file = Promise.resolve(false);
    test_package.has_license_in_package_json = Promise.resolve(false);
    test_package.has_license_in_readme = Promise.resolve(false);
    test_package.license = 0;
    test_package.comment_ratio = Promise.resolve(0);
    test_package.readme_size = Promise.resolve(0);
    test_package.ramp_up = 0;
    test_package.responsiveness = 0;
    test_package.total_commits = 0;
    test_package.score = 0;
  });
  test("test initilization", () => {
    let runner_test = new Runner(test_package);
    expect(runner_test.package_instance).toBe(test_package);
  });
  test("test correctness calculation", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.commit_count = 1000;
    runner_test.package_instance.num_stars = 10000;
    runner_test.package_instance.issues_active = 100;
    runner_test.package_instance.issues = 10000;
    await runner_test.calculate_correctness();
    expect(runner_test.package_instance.correctness).toBeCloseTo(
      Math.min(
        0.2 * (runner_test.package_instance.num_stars / 10000) +
          0.5 * runner_test.package_instance.commit_count +
          0.8 *
            (runner_test.package_instance.issues_active /
              runner_test.package_instance.issues),
        1
      )
    );
    runner_test.package_instance.commit_count = 10;
    runner_test.package_instance.num_stars = 100;
    runner_test.package_instance.issues_active = 10;
    runner_test.package_instance.issues = 100;
    runner_test.calculate_correctness();
    expect(runner_test.package_instance.correctness).toBeCloseTo(
      Math.min(
        0.2 * (runner_test.package_instance.num_stars / 10000) +
          0.5 * runner_test.package_instance.commit_count +
          0.8 *
            (runner_test.package_instance.issues_active /
              runner_test.package_instance.issues),
        1
      )
    );
  });

  test("test bus factor calculation", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.num_dev = 2;
    runner_test.package_instance.pr_count = 10000;
    runner_test.package_instance.num_stars = 777;
    await runner_test.calculate_bus();
    expect(runner_test.package_instance.bus_factor).toBeCloseTo(
      Math.min(
        7 *
          (runner_test.package_instance.num_dev /
            runner_test.package_instance.pr_count) +
          0.3 * (runner_test.package_instance.num_stars / 10000),
        1
      )
    );
    runner_test.package_instance.num_dev = 1;
    runner_test.package_instance.pr_count = 0;
    runner_test.package_instance.num_stars = 100;
    await runner_test.calculate_bus();
    expect(runner_test.package_instance.bus_factor).toBeCloseTo(0);
  });

  test("test license calculation", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.has_license_file = Promise.resolve(true);
    runner_test.package_instance.has_license_in_package_json =
      Promise.resolve(false);
    runner_test.package_instance.has_license_in_readme = Promise.resolve(false);
    runner_test.package_instance.has_correct_license_in_readme =
      Promise.resolve(false);
    await runner_test.calculate_license();
    expect(runner_test.package_instance.license).toBe(0);
  });

  test("test license calculation with correct license", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.has_license_file = Promise.resolve(false);
    runner_test.package_instance.has_license_in_package_json =
      Promise.resolve(false);
    runner_test.package_instance.has_license_in_readme = Promise.resolve(false);
    runner_test.package_instance.has_correct_license_in_readme =
      Promise.resolve(true);
    await runner_test.calculate_license();
    expect(runner_test.package_instance.license).toBe(1);
  });

  test("test license calculation with correct license in readme", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.has_license_file = Promise.resolve(true);
    runner_test.package_instance.has_license_in_package_json =
      Promise.resolve(true);
    runner_test.package_instance.has_license_in_readme = Promise.resolve(true);
    runner_test.package_instance.has_correct_license_in_readme =
      Promise.resolve(false);
    await runner_test.calculate_license();
    expect(runner_test.package_instance.license).toBeCloseTo(0.2);
  });

  test("test ramp up calculation", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.comment_ratio = Promise.resolve(1);
    runner_test.package_instance.readme_size = Promise.resolve(1000);
    await runner_test.calculate_ramp();
    expect(runner_test.package_instance.ramp_up).toBeCloseTo(0.64);
  });

  test("test responsiveness calculation", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.pr_count = 10000;
    runner_test.package_instance.commit_count = 1000;
    runner_test.package_instance.total_commits = 10000;
    await runner_test.calculate_responsiveness();
    expect(runner_test.package_instance.responsiveness).toBeCloseTo(1);
  });

  test("test score calculation", async () => {
    let runner_test = new Runner(test_package);
    runner_test.package_instance.license = 0;
    runner_test.package_instance.bus_factor = 0.86;
    runner_test.package_instance.correctness = 0.75;
    runner_test.package_instance.ramp_up = 0.3;
    runner_test.package_instance.responsiveness = 0.9;
    await runner_test.calculate_score();
    expect(runner_test.package_instance.score).toBeCloseTo(0.571);
  });
});
