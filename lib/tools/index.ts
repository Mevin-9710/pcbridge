import { registerTool } from "../mcp-server";
import { readFileTool } from "./file-tools";
import { runCommandTool } from "./terminal-tools";
import { gitStatusTool, gitDiffTool, gitLogTool } from "./git-tools";
import { getStatusTool } from "./status-tools";

export function registerAllTools(): void {
  registerTool(readFileTool);
  registerTool(runCommandTool);
  registerTool(gitStatusTool);
  registerTool(gitDiffTool);
  registerTool(gitLogTool);
  registerTool(getStatusTool);
}
