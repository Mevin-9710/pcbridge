import fs from "fs";
import path from "path";
import { RunnerConfig } from "../config";

export class FileTools {
  private config: RunnerConfig;

  constructor(config: RunnerConfig) {
    this.config = config;
  }

  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) return filePath;
    return path.join(this.config.projectDir, filePath);
  }

  private isPathSafe(filePath: string): boolean {
    const resolved = this.resolvePath(filePath);
    const projectDir = path.resolve(this.config.projectDir);
    return resolved.startsWith(projectDir);
  }

  async readFile(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const filePath = args.path as string;
    if (!filePath) {
      return { content: [{ type: "text", text: "Error: path is required" }], isError: true };
    }

    if (!this.isPathSafe(filePath)) {
      return { content: [{ type: "text", text: "Error: Path is outside project directory" }], isError: true };
    }

    try {
      const resolved = this.resolvePath(filePath);
      const content = fs.readFileSync(resolved, "utf-8");
      return { content: [{ type: "text", text: content }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error reading file: ${message}` }], isError: true };
    }
  }

  async writeFile(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const filePath = args.path as string;
    const content = args.content as string;

    if (!filePath || content === undefined) {
      return { content: [{ type: "text", text: "Error: path and content are required" }], isError: true };
    }

    if (!this.isPathSafe(filePath)) {
      return { content: [{ type: "text", text: "Error: Path is outside project directory" }], isError: true };
    }

    try {
      const resolved = this.resolvePath(filePath);
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(resolved, content, "utf-8");
      return { content: [{ type: "text", text: `File written: ${resolved}` }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error writing file: ${message}` }], isError: true };
    }
  }

  async editFile(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const filePath = args.path as string;
    const search = args.search as string;
    const replace = args.replace as string;

    if (!filePath || search === undefined || replace === undefined) {
      return { content: [{ type: "text", text: "Error: path, search, and replace are required" }], isError: true };
    }

    if (!this.isPathSafe(filePath)) {
      return { content: [{ type: "text", text: "Error: Path is outside project directory" }], isError: true };
    }

    try {
      const resolved = this.resolvePath(filePath);
      const content = fs.readFileSync(resolved, "utf-8");

      if (!content.includes(search)) {
        return { content: [{ type: "text", text: "Error: Search text not found in file" }], isError: true };
      }

      const newContent = content.replace(search, replace);
      fs.writeFileSync(resolved, newContent, "utf-8");
      return { content: [{ type: "text", text: `File edited: ${resolved}` }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error editing file: ${message}` }], isError: true };
    }
  }

  async listFiles(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const dirPath = (args.path as string) || ".";

    if (!this.isPathSafe(dirPath)) {
      return { content: [{ type: "text", text: "Error: Path is outside project directory" }], isError: true };
    }

    try {
      const resolved = this.resolvePath(dirPath);
      const entries = fs.readdirSync(resolved, { withFileTypes: true });
      const items = entries.map((entry) => {
        const type = entry.isDirectory() ? "dir" : "file";
        return `${type === "dir" ? "[D]" : "[F]"} ${entry.name}`;
      });

      return { content: [{ type: "text", text: items.join("\n") }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error listing files: ${message}` }], isError: true };
    }
  }

  async deleteFile(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const filePath = args.path as string;
    if (!filePath) {
      return { content: [{ type: "text", text: "Error: path is required" }], isError: true };
    }

    if (!this.isPathSafe(filePath)) {
      return { content: [{ type: "text", text: "Error: Path is outside project directory" }], isError: true };
    }

    try {
      const resolved = this.resolvePath(filePath);
      fs.unlinkSync(resolved);
      return { content: [{ type: "text", text: `File deleted: ${resolved}` }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error deleting file: ${message}` }], isError: true };
    }
  }
}
