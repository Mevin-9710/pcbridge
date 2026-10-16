import fs from "fs";
import path from "path";
import { RunnerConfig } from "../config";

export class SearchTools {
  private config: RunnerConfig;

  constructor(config: RunnerConfig) {
    this.config = config;
  }

  async searchFiles(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const pattern = args.pattern as string;
    const dirPath = (args.path as string) || ".";

    if (!pattern) {
      return { content: [{ type: "text", text: "Error: pattern is required" }], isError: true };
    }

    try {
      const resolved = path.join(this.config.projectDir, dirPath);
      const results = this.searchInDirectory(resolved, pattern);
      return {
        content: [{ type: "text", text: results.join("\n") || "No matches found" }],
        isError: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  private searchInDirectory(dir: string, pattern: string): string[] {
    const results: string[] = [];
    const regex = new RegExp(pattern, "i");

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === ".git") continue;
          results.push(...this.searchInDirectory(fullPath, pattern));
        } else {
          if (regex.test(entry.name)) {
            results.push(fullPath);
          }
        }
      }
    } catch {
      // Ignore permission errors
    }

    return results;
  }

  async grepFiles(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const pattern = args.pattern as string;
    const dirPath = (args.path as string) || ".";

    if (!pattern) {
      return { content: [{ type: "text", text: "Error: pattern is required" }], isError: true };
    }

    try {
      const resolved = path.join(this.config.projectDir, dirPath);
      const results = this.grepInDirectory(resolved, pattern);
      return {
        content: [{ type: "text", text: results.join("\n") || "No matches found" }],
        isError: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  private grepInDirectory(dir: string, pattern: string): string[] {
    const results: string[] = [];
    const regex = new RegExp(pattern, "i");

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === ".git") continue;
          results.push(...this.grepInDirectory(fullPath, pattern));
        } else {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (regex.test(lines[i])) {
                results.push(`${fullPath}:${i + 1}: ${lines[i].trim()}`);
              }
            }
          } catch {
            // Ignore files that can't be read
          }
        }
      }
    } catch {
      // Ignore permission errors
    }

    return results;
  }
}
