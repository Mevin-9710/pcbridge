import { Tool } from "../types";
import { executeTool } from "../mcp-server";

export const readFileTool: Tool = {
  name: "read_file",
  description: "Read the contents of a file on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute path to the file to read",
      },
    },
    required: ["path"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("read_file", args, deviceId);
    return result;
  },
};

export const writeFileTool: Tool = {
  name: "write_file",
  description: "Write content to a file on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute path to the file to write",
      },
      content: {
        type: "string",
        description: "Content to write to the file",
      },
    },
    required: ["path", "content"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("write_file", args, deviceId);
    return result;
  },
};

export const editFileTool: Tool = {
  name: "edit_file",
  description: "Edit a file by searching and replacing text on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute path to the file to edit",
      },
      search: {
        type: "string",
        description: "Text to search for",
      },
      replace: {
        type: "string",
        description: "Text to replace with",
      },
    },
    required: ["path", "search", "replace"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("edit_file", args, deviceId);
    return result;
  },
};

export const listFilesTool: Tool = {
  name: "list_files",
  description: "List files in a directory on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute path to the directory to list",
      },
    },
    required: ["path"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("list_files", args, deviceId);
    return result;
  },
};

export const deleteFileTool: Tool = {
  name: "delete_file",
  description: "Delete a file on the connected computer (requires approval)",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute path to the file to delete",
      },
    },
    required: ["path"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("delete_file", args, deviceId);
    return result;
  },
};
