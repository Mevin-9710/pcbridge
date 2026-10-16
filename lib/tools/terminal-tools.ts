import { Tool } from "../types";
import { executeTool } from "../mcp-server";

export const runCommandTool: Tool = {
  name: "run_command",
  description:
    "Execute a terminal command on the connected computer (requires approval for destructive commands)",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The terminal command to execute",
      },
      cwd: {
        type: "string",
        description: "Working directory for the command (optional)",
      },
    },
    required: ["command"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("run_command", args, deviceId);
    return result;
  },
};
