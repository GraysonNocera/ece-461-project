// File for functions to get information from cloned repo
import path from "path";
import * as cr from "../src/clone_repo";
import { Package } from "../src/package_class";
import { LogLevel } from "typescript-logging";
import * as logging from "../src/logging";
import { Log4TSProvider } from "typescript-logging-log4ts-style";

describe("Tests for logging.ts", () => {
  test.each([
    { environment_var: "0", expected_level: 0 },
    { environment_var: "1", expected_level: LogLevel.Info },
    { environment_var: "2", expected_level: LogLevel.Debug },
    { environment_var: undefined, expected_level: 0 },
  ])("test get_log_level", ({ environment_var, expected_level }) => {
    process.env.LOG_LEVEL = environment_var;
    let level: number = logging.get_log_level();
    expect(level).toEqual(expected_level);
  });

  test.each([
    {
      environment_var: path.join(process.cwd(), "logging.log"),
      expected_output: true,
    },
    { environment_var: "garbage/path", expected_output: false },
    { environment_var: "", expected_output: false },
  ])("test get_log_level", ({ environment_var, expected_output }) => {
    process.env.LOG_FILE = environment_var;
    let can_open: boolean = logging.open_log_file();
    expect(can_open).toEqual(expected_output);
  });

  test("test get_provider", () => {
    Log4TSProvider.clear()
    let provider: Log4TSProvider = logging.get_provider();
    expect(provider).toBeDefined();
  });
});
