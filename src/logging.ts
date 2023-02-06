import fs from "fs";
import {LogLevel, LogMessage } from "typescript-logging";
import { Log4TSProvider, Logger } from "typescript-logging-log4ts-style";

let level: number = 0;
if (process.env.LOG_LEVEL != undefined) {
    console.log(process.env.LOG_LEVEL)
    if (Number(process.env.LOG_LEVEL) == 1) {
        // Informational messages
        level = LogLevel.Info
    } else if (Number(process.env.LOG_LEVEL) == 2) {
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

export const provider: Log4TSProvider = Log4TSProvider.createProvider("Logging", {
  level: level,
  groups: [{
    identifier: "MatchAll",
    expression: new RegExp(".+")
  }],
  channel: {
    type: "LogChannel",
    write: (msg: LogMessage) => {
        let path: string = "";

        // Only write to file if log file has been provided and log level is not silent
        if (process.env.LOG_FILE && Number(process.env.LOG_LEVEL) != 0) {
            path = process.env.LOG_FILE;

            fs.appendFile(path, msg.message, {}, (err) => {
                if (err)
                    console.log(err)
            })
        }
    },
  }
});

// Create some loggers
export const root_graphql: Logger = provider.getLogger("GraphQL")
export const root_rest: Logger = provider.getLogger("REST")
export const root_cloned: Logger = provider.getLogger("Cloned")
export const root_scoring: Logger = provider.getLogger("Scoring")
export const root_cli: Logger = provider.getLogger("CLI")

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

// const provider_test: Log4TSProvider = Log4TSProvider.createProvider("Test", {
//     level: LogLevel.Debug,
//     channel: {
//       type: "LogChannel",
//       write: (msg: LogMessage) => {
//           let path: string = "";
//           if (process.env.LOG_FILE) {
//               path = process.env.LOG_FILE;
  
//               fs.appendFile(path, msg.message, {}, (err) => {
//                   if (err)
//                       console.log(err)
//               })
//           }
//       },
//     },
// });

// const root = provider_test.getCategory("Stuff")
// root.info("Should not print\n")
// root.debug("Should print\n")
// console.log(root.logLevel)
// console.log(root.runtimeSettings)
// const child = root.getChildCategory("hi")
// console.log(child.logLevel)

// const log4Provider = Log4TSProvider.createProvider("Provider_test_haha", {
//     level: LogLevel.Info,
//     // groups: [{
//     //     expression: new RegExp(".+")
//     // }]
//     groups: [{
//         identifier: "MatchAll",
//         expression: new RegExp(".+"),
//     }],
//     channel: {
//         type: "LogChannel",
//         write: (msg: LogMessage) => {
//             let path: string = "";
//             if (process.env.LOG_FILE) {
//                 path = process.env.LOG_FILE;
    
//                 fs.appendFile(path, msg.message, {}, (err) => {
//                     if (err)
//                         console.log(err)
//                 })
//             }
//         },
//     }
// });

// if (process.env.LOG_FILE) {
//     try {
//         fs.writeFileSync(process.env.LOG_FILE, "")
//     } catch {
//         // Invalid file
//         console.log("Invalid log file")
//     }
// }

// const test_logger = log4Provider.getLogger("can")
// test_logger.debug("Hello\n")
// test_logger.info("hi\n")