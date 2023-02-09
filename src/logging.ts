import * as fs from "fs";
import { LogLevel, LogMessage } from "typescript-logging";
import { Log4TSProvider, Logger } from "typescript-logging-log4ts-style";

function get_log_level(): number {
  // Get the log level from the environment variable
  // :return: number corresponding to log level

  let level: number = 0;
  if (process.env.LOG_LEVEL != undefined) {
    if (Number(process.env.LOG_LEVEL) == 1) {
      // Informational messages
      level = LogLevel.Info;
    } else if (Number(process.env.LOG_LEVEL) == 2) {
      // Debug messages
      level = LogLevel.Debug;
    }
  }

  return level;
}

function create_log_file(): boolean {
  // Create log file
  // :return: boolean for if file was created correctly

  // Check for log file environment variable
  if (process.env.LOG_FILE) {
    try {
      fs.writeFileSync(process.env.LOG_FILE, "");
    } catch {
      // Invalid file
      return false;
    }
  } else {
    // No LOG_FILE env variable defined
    return false;
  }

  return true;
}

function write_setting(msg: LogMessage): void {
  // Defines how to write log files
  // :param msg: logMessage to be written

  let path: string = "";
  let message: string = "";

  // Only write to file if log file has been provided and log level is not silent
  if (process.env.LOG_FILE && Number(process.env.LOG_LEVEL) != 0) {
    path = process.env.LOG_FILE;

    if (msg.message.endsWith("\n")) {
      message = msg.message;
    } else {
      message = msg.message + "\n";
    }

    fs.appendFile(path, message, {}, (err) => {
      if (err) return false;
    });
  }
}

function get_provider(): Log4TSProvider {
  // Create logging interface (functions as main)
  // :return: whether the logging interface succeeded

  // Get the log level
  let level: number = get_log_level();

  // Create file
  if (!create_log_file()) {}

  // Define how logging should be written (i.e. to a file)
  let provider: Log4TSProvider = Log4TSProvider.createProvider("Logging", {
    level: level,
    groups: [
      {
        identifier: "MatchAll",
        expression: new RegExp(".+"),
      },
    ],
    channel: {
      type: "LogChannel",
      write: write_setting,
    },
  });

  return provider
}

export const provider: Log4TSProvider = get_provider()

