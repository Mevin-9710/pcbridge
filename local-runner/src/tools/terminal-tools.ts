import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { RunnerConfig } from "../config";

const execAsync = promisify(exec);

const DESTRUCTIVE_PATTERNS = [
  /\brm\s+-[rf]/i,
  /\brm\s+-fr/i,
  /\brm\s+-rf/i,
  /\bmkfs/i,
  /\bdd\s+.*of=\/dev\//i,
  /\bchmod\s+-R\s+777/i,
  /\bchown\s+-R/i,
  /\bsudo\s+rm/i,
  /\bgit\s+push\s+--force/i,
  /\bgit\s+reset\s+--hard/i,
  /\bgit\s+clean\s+-fd/i,
  /\bnpm\s+publish/i,
  /\bdocker\s+system\s+prune/i,
  /\btruncate\s+-s\s+0/i,
  /\bmv\s+.*\/\//i,
];

export class TerminalTools {
  private config: RunnerConfig;

  constructor(config: RunnerConfig) {
    this.config = config;
  }

  private isDestructive(command: string): boolean {
    return DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(command));
  }

  async runCommand(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const command = args.command as string;
    const cwd = (args.cwd as string) || this.config.projectDir;

    if (!command) {
      return { content: [{ type: "text", text: "Error: command is required" }], isError: true };
    }

    if (this.isDestructive(command) && this.config.requireApproval) {
      return {
        content: [
          {
            type: "text",
            text: `This command requires approval: ${command}\nIt was flagged as potentially destructive. Please approve it on the dashboard.`,
          },
        ],
        isError: false,
      };
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      let output = "";
      if (stdout) output += stdout;
      if (stderr) output += (output ? "\n" : "") + stderr;

      return {
        content: [{ type: "text", text: output || "(no output)" }],
        isError: false,
      };
    } catch (error: unknown) {
      const err = error as { stdout?: string; stderr?: string; message?: string };
      let output = "";
      if (err.stdout) output += err.stdout;
      if (err.stderr) output += (output ? "\n" : "") + err.stderr;
      if (err.message) output += (output ? "\n" : "") + err.message;

      return {
        content: [{ type: "text", text: output || `Error: ${err.message || "Command failed"}` }],
        isError: true,
      };
    }
  }
}
