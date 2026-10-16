import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { RunnerConfig } from "../config";

const execAsync = promisify(exec);

export class GitTools {
  private config: RunnerConfig;

  constructor(config: RunnerConfig) {
    this.config = config;
  }

  private resolvePath(repoPath: string): string {
    if (path.isAbsolute(repoPath)) return repoPath;
    return path.join(this.config.projectDir, repoPath);
  }

  async status(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const repoPath = (args.path as string) || ".";

    try {
      const resolved = this.resolvePath(repoPath);
      const { stdout } = await execAsync("git status", { cwd: resolved });
      return { content: [{ type: "text", text: stdout }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  async diff(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const repoPath = (args.path as string) || ".";
    const staged = args.staged as boolean;

    try {
      const resolved = this.resolvePath(repoPath);
      const flag = staged ? "--staged" : "";
      const { stdout } = await execAsync(`git diff ${flag}`, { cwd: resolved });
      return { content: [{ type: "text", text: stdout || "(no changes)" }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  async log(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const repoPath = (args.path as string) || ".";
    const limit = (args.limit as number) || 10;

    try {
      const resolved = this.resolvePath(repoPath);
      const { stdout } = await execAsync(`git log --oneline -${limit}`, { cwd: resolved });
      return { content: [{ type: "text", text: stdout }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  async commit(args: Record<string, unknown>): Promise<{
    content: Array<{ type: "text"; text: string }>;
    isError: boolean;
  }> {
    const repoPath = (args.path as string) || ".";
    const message = args.message as string;

    if (!message) {
      return { content: [{ type: "text", text: "Error: message is required" }], isError: true };
    }

    if (this.config.requireApproval) {
      return {
        content: [
          {
            type: "text",
            text: `Git commit requires approval: "${message}"\nPlease approve it on the dashboard.`,
          },
        ],
        isError: false,
      };
    }

    try {
      const resolved = this.resolvePath(repoPath);
      await execAsync(`git add -A`, { cwd: resolved });
      const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
        cwd: resolved,
      });
      return { content: [{ type: "text", text: stdout }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
}
