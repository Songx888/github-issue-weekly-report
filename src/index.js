#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { loadRepositoryActivity } from "./github.js";
import { buildWeeklyReport } from "./report.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configPath = args.config ?? "config.json";
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const activity = args.mock
    ? JSON.parse(await readFile(args.mock, "utf8"))
    : await loadRepositoryActivity(config, process.env.GITHUB_TOKEN);

  const report = buildWeeklyReport(activity, config);
  const outputPath = config.output ?? "weekly-report.md";
  await writeFile(outputPath, report, "utf8");
  console.log(`Report written to ${outputPath}`);
}

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--config") {
      parsed.config = args[index + 1];
      index += 1;
    } else if (arg === "--mock") {
      parsed.mock = args[index + 1];
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`
Usage:
  node ./src/index.js --config config.json
  node ./src/index.js --config examples/demo.config.json --mock examples/demo-data.json

Options:
  --config <path>  Path to the JSON config file
  --mock <path>    Read activity from a local JSON file instead of GitHub
  --help           Show this help message
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
