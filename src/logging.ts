// import { doesNotMatch } from "assert"

// print variable false

// if x = 5 then y = 3
// print variable XMLDocument

// u are so cute :) now i am doesNotMatch

import fs, { PathOrFileDescriptor } from "fs";

/*--- config/LogConfig.ts ---*/
import {LogLevel, LogMessage} from "typescript-logging";
import {CategoryProvider, Category} from "typescript-logging-category-style";

let level: number = -1;
if (process.env.LOG_FILE) {
    if (Number(process.env.LOG_FILE) == 0) {
        // Silent
        level = LogLevel.Warn // Use throwaway log level for silent
    } else if (Number(process.env.LOG_FILE) == 1) {
        // Informational messages
        level = LogLevel.Info
    } else if (Number(process.env.LOG_FILE) == 2) {
        // Debug messages
        level = LogLevel.Debug
    }
}

if (process.env.LOG_FILE) {
    try {
        fs.writeFileSync(process.env.LOG_FILE, "")
    } catch {
        // Invalid file
        console.log("Invalid log file")
    }
}

const provider = CategoryProvider.createProvider("ExampleProvider", {
  level: level,
  channel: {
    type: "LogChannel",
    write: (msg: LogMessage) => {
        let path: string = "";
        if (process.env.LOG_FILE) {
            path = process.env.LOG_FILE;

            fs.appendFile(path, msg.message, {}, (err) => {
                if (err)
                    console.log(err)
            })
        }
    },
  }
});

/* Create some root categories for this example, you can also expose getLogger() from the provider instead e.g. */
export const root_graphql: Category = provider.getCategory("GraphQL")
export const root_rest: Category = provider.getCategory("REST")
export const root_cloned: Category = provider.getCategory("Cloned")
export const root_scoring: Category = provider.getCategory("Scoring")
export const root_cli: Category = provider.getCategory("CLI")

/* Creates a child category/logger called "Account" below "model" */
// const log = rootService.getChildCategory("Account");
// log.debug(() => 'Creating new account with name hi\n')
// log.info(() => 'Create new account\n')

// const sublog = log.getChildCategory("NewAccount")
// sublog.info(() => "Info\n")
// sublog.debug(() => "Debug\n")
// sublog.debug("Debug message\n")

// rootModel.info("Info message\n")
// rootModel.debug("Debug message\n")
// rootService.info("Info message\n")
// rootService.debug("Debug message\n")

// // Assume 'log' is our Logger here.
// log.debug("This is a simple message\n");
// log.debug("This is a simple message and we log an Error (normally you'd catch it and then log it)\n", new Error("Some Exception"));
// log.debug(() => "Simple message as lambda\n");
// log.debug(() => "Simple message as lambda with Error\n", () => new Error("SomeOther"));
// log.debug("Simple message with some random arguments\n", 100, "abc", ["some", "array"], true);
// log.debug(() => "Simple message as lambda with Error and some random arguments\n", new Error("Some Exception"), 100, "abc", ["some", "array"], true);
