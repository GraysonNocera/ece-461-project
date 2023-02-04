/*

import axios, { AxiosResponse } from "axios";
import isGitHubUrl = require("is-github-url");
import * as URL from "url";

const MAX_RETRIES = 1;

async function npm_2_git(npmUrl: string): Promise<string> {
  // check if input is a valid URL
  if (!URL.parse(npmUrl).hostname) {
    throw new Error(`Invalid NPM package URL: ${npmUrl}`);
  }

  // extract the package name from the npm URL
  const packageName = npmUrl.split("/").pop();

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      // use the npm registry API to get the package information
      const response: AxiosResponse = await axios.get(
        `https://registry.npmjs.org/${packageName}`
      );
      const packageInfo = response.data;

      // check if package have repository
      if (!packageInfo.repository) {
        throw new Error(`No repository found for package: ${packageName}`);
      }

      // check if repository is on github
      if (isGitHubUrl(packageInfo.repository.url)) {
        return packageInfo.repository.url.replace("git+https", "git");
      } else {
        throw new Error(
          `Repository of package: ${packageName} is not on GitHub`
        );
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Package not found: ${packageName}`);
      } else if (error.response && error.response.status === 429) {
        throw new Error(
          `Rate limit exceeded: ${error.response.headers["Retry-After"]} seconds`
        );
      } else if (error.code === "ECONNREFUSED") {
        console.log(`Error: ${error.code}. Retrying...`);
        retries++;
        continue;
      } else {
        throw error;
      }
    }
  }
  throw new Error(
    `Error: Maximum retries exceeded for package: ${packageName}`
  );
}

(async () => {
  try {
    const npmUrl = "https://www.npmjs.com/package/even";
    console.log(await npm_2_git(npmUrl));
  } catch (error) {
    console.error(error);
  }
})();

*/
