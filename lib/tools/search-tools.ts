import { Tool } from "../types";
import { executeTool } from "../mcp-server";

export const searchFilesTool: Tool = {
  name: "search_files",
  description: "Search for files by name pattern on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "Regex pattern to search for in file names",
      },
      path: {
        type: "string",
        description: "Directory to search in (default: project root)",
      },
    },
    required: ["pattern"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("search_files", args, deviceId);
    return result;
  },
};

export const grepFilesTool: Tool = {
  name: "grep_files",
  description: "Search for text within files on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "Regex pattern to search for in file contents",
      },
      path: {
        type: "string",
        description: "Directory to search in (default: project root)",
      },
    },
    required: ["pattern"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("grep_files", args, deviceId);
    return result;
  },
};
