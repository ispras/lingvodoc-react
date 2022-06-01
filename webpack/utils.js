const path = require("path");
const child_process = require("child_process");

const config = require("./config");

const buildType = process.env.LINGVODOC_BUILD_TYPE ? process.env.LINGVODOC_BUILD_TYPE : "server";

/* Constructing version info. */

var versionString = "";

try {
  const describeOutput = child_process
    .spawnSync("git", ["describe", "--abbrev=8", "--always", "--dirty", "--long", "--tags", "--match", "v*"])
    .stdout.toString();

  const describeMatch = describeOutput.match(/v(.*?)-(\d+)-g([0-9a-fA-F]+(-dirty)?)?/);

  var versionString = describeOutput.trim();

  if (describeMatch) {
    const commitCount = Number(describeMatch[2]);

    const commitString = commitCount > 0 ? `+${commitCount}` : "";

    versionString = `${describeMatch[1]}${commitString}-${describeMatch[3]}`;
  }
} catch (error) {}

if ("LINGVODOC_BUILD_NUMBER" in process.env) {
  if (versionString) {
    versionString += "-";
  }

  versionString += process.env.LINGVODOC_BUILD_NUMBER;
} else if ("TRAVIS_BUILD_NUMBER" in process.env) {
  if (versionString) {
    versionString += "-";
  }

  versionString += process.env.TRAVIS_BUILD_NUMBER;
}

if ("LINGVODOC_BRANCH" in process.env) {
  if (versionString) {
    versionString += "-";
  }

  versionString += process.env.LINGVODOC_BRANCH;
} else if ("TRAVIS_BRANCH" in process.env) {
  if (versionString) {
    versionString += "-";
  }

  versionString += process.env.TRAVIS_BRANCH;
}

if ("LINGVODOC_BUILD_TYPE" in process.env) {
  if (versionString) {
    versionString += "-";
  }

  versionString += process.env.LINGVODOC_BUILD_TYPE;
}

module.exports = {
  cwd(file) {
    return path.join(process.cwd(), file || "");
  },
  outputPath: path.join(__dirname, `../dist/${buildType}`, config.publicPath),
  outputIndexPath: path.join(__dirname, `../dist/${buildType}/index.html`),
  target: "browserslist",
  loadersOptions() {
    const isProd = process.env.NODE_ENV === "production";

    return {
      minimize: isProd,
      options: {
        context: process.cwd()
      }
    };
  },
  versionString
};
