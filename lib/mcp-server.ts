import { Tool } from "./types";
import { createRequest, getResponse, submitResponse } from "./request-queue";
import { getDevice, updateDeviceLastSeen } from "./device-registry";

const tools = new Map<string, Tool>();

export function registerTool(tool: Tool): void {
  tools.set(tool.name, tool);
}

export function getTools(): Tool[] {
  return Array.from(tools.values());
}

export function getTool(name: string): Tool | undefined {
  return tools.get(name);
}

export function listTools() {
  return Array.from(tools.values()).map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  deviceId: string
): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> {
  const tool = tools.get(toolName);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
      isError: true,
    };
  }

  const device = getDevice(deviceId);
  if (!device || device.status !== "online") {
    return {
      content: [{ type: "text", text: "Device is not connected" }],
      isError: true,
    };
  }

  updateDeviceLastSeen(deviceId);

  const requiresApproval = requiresApprovalFor(toolName, args);
  const request = createRequest(deviceId, toolName, args, requiresApproval);

  if (requiresApproval) {
    return {
      content: [
        {
          type: "text",
          text: `This operation requires approval. Request ID: ${request.id}. Please approve it on the dashboard.`,
        },
      ],
      isError: false,
    };
  }

  try {
    const result = await tool.handler(args, deviceId);
    submitResponse(request.id, deviceId, result.content, result.isError || false);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    submitResponse(
      request.id,
      deviceId,
      [{ type: "text", text: `Error: ${message}` }],
      true
    );
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
}

function requiresApprovalFor(
  toolName: string,
  _args: Record<string, unknown>
): boolean {
  const approvalRequiredTools = ["run_command", "git_commit", "delete_file"];
  return approvalRequiredTools.includes(toolName);
}
