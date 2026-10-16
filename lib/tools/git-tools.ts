import { Tool } from "../types";
import { executeTool } from "../mcp-server";

export const gitStatusTool: Tool = {
  name: "git_status",
  description: "Get the git status of a repository on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the git repository",
      },
    },
    required: ["path"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("git_status", args, deviceId);
    return result;
  },
};

export const gitDiffTool: Tool = {
  name: "git_diff",
  description: "Get the git diff of a repository on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the git repository",
      },
      staged: {
        type: "boolean",
        description: "Show staged changes (default: unstaged)",
      },
    },
    required: ["path"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("git_diff", args, deviceId);
    return result;
  },
};

export const gitLogTool: Tool = {
  name: "git_log",
  description: "Get the git log of a repository on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the git repository",
      },
      limit: {
        type: "number",
        description: "Number of commits to show (default: 10)",
      },
    },
    required: ["path"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("git_log", args, deviceId);
    return result;
  },
};

export const gitCommitTool: Tool = {
  name: "git_commit",
  description: "Commit changes in a git repository (requires approval)",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the git repository",
      },
      message: {
        type: "string",
        description: "Commit message",
      },
    },
    required: ["path", "message"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("git_commit", args, deviceId);
    return result;
  },
};
