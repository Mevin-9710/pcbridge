import { registerTool } from "../mcp-server";
import { readFileTool, writeFileTool, editFileTool, listFilesTool, deleteFileTool } from "./file-tools";
import { runCommandTool } from "./terminal-tools";
import { gitStatusTool, gitDiffTool, gitLogTool, gitCommitTool } from "./git-tools";
import { getStatusTool } from "./status-tools";
import { listSkillsTool, getSkillTool } from "./skill-tools";

export function registerAllTools(): void {
  registerTool(readFileTool);
  registerTool(writeFileTool);
  registerTool(editFileTool);
  registerTool(listFilesTool);
  registerTool(deleteFileTool);
  registerTool(runCommandTool);
  registerTool(gitStatusTool);
  registerTool(gitDiffTool);
  registerTool(gitLogTool);
  registerTool(gitCommitTool);
  registerTool(getStatusTool);
  registerTool(listSkillsTool);
  registerTool(getSkillTool);
}
