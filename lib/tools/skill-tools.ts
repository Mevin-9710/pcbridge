import { Tool } from "../types";
import { executeTool } from "../mcp-server";

export const listSkillsTool: Tool = {
  name: "list_skills",
  description: "List available skills on the connected computer",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async (_args, deviceId) => {
    const result = await executeTool("list_skills", {}, deviceId);
    return result;
  },
};

export const getSkillTool: Tool = {
  name: "get_skill",
  description: "Get the content of a specific skill on the connected computer",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the skill to retrieve",
      },
    },
    required: ["name"],
  },
  handler: async (args, deviceId) => {
    const result = await executeTool("get_skill", args, deviceId);
    return result;
  },
};
