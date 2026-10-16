#!/usr/bin/env node

import { Command } from "commander";
import { Runner } from "./runner";
import { ConfigManager, RunnerConfig } from "./config";
import chalk from "chalk";

const program = new Command();

program
  .name("pcbridge")
  .description("PCBridge - Use your computer like a coding agent")
  .version("0.1.0");

program
  .command("start")
  .description("Start the PCBridge runner")
  .option("-c, --code <code>", "Pairing code from the dashboard")
  .option("-a, --api <url>", "API URL", "https://pcbridge.vercel.app")
  .option("-d, --device <name>", "Device name", "My Computer")
  .option("-p, --project <dir>", "Project directory", process.cwd())
  .option("--no-approval", "Disable approval for destructive operations")
  .action(async (options) => {
    const config: RunnerConfig = {
      apiUrl: options.api,
      deviceName: options.device,
      projectDir: options.project,
      requireApproval: !options.noApproval,
      pairingCode: options.code,
    };

    const runner = new Runner(config);

    console.log(chalk.blue.bold("PCBridge Runner"));
    console.log(chalk.gray("─".repeat(40)));

    if (config.pairingCode) {
      console.log(chalk.yellow("Pairing with code:"), config.pairingCode);
    }

    console.log(chalk.gray("API URL:"), config.apiUrl);
    console.log(chalk.gray("Project:"), config.projectDir);
    console.log(chalk.gray("Approval required:"), config.requireApproval ? "Yes" : "No");
    console.log();

    try {
      await runner.start();
    } catch (error) {
      console.error(chalk.red("Failed to start:"), error);
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Check runner status")
  .action(async () => {
    const config = ConfigManager.load();
    if (!config) {
      console.log(chalk.yellow("PCBridge is not configured. Run 'pcbridge start' first."));
      return;
    }

    console.log(chalk.blue.bold("PCBridge Status"));
    console.log(chalk.gray("─".repeat(40)));
    console.log(chalk.gray("Device:"), config.deviceName);
    console.log(chalk.gray("API URL:"), config.apiUrl);
    console.log(chalk.gray("Project:"), config.projectDir);
    console.log(chalk.gray("Device ID:"), config.deviceId || "Not paired");
  });

program.parse();
