import { Tool } from "./types";
import { createRequest, getResponse } from "./request-queue";
import { getDevice, updateDeviceLastSeen } from "./device-registry";

interface McpState {
  tools: Map<string, Tool>;
}

function getState(): McpState {
  const g = globalThis as typeof globalThis & { __pcbridgeMcp?: McpState };
  if (!g.__pcbridgeMcp) {
    g.__pcbridgeMcp = { tools: new Map() };
  }
  return g.__pcbridgeMcp;
}

export function registerTool(tool: Tool): void {
  getState().tools.set(tool.name, tool);
}

export function getTools(): Tool[] {
  return Array.from(getState().tools.values());
}

export function getTool(name: string): Tool | undefined {
  return getState().tools.get(name);
}

export function listTools() {
  return Array.from(getState().tools.values()).map((t) => ({
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
  const tool = getState().tools.get(toolName);
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

  const response = await waitForResponse(request.id, 30000);
  if (!response) {
    return {
      content: [
        { type: "text", text: "Timeout waiting for device to respond. Is the PCBridge runner running?" },
      ],
      isError: true,
    };
  }

  return { content: response.content, isError: response.isError };
}

function waitForResponse(
  requestId: string,
  timeoutMs: number
): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean } | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const response = getResponse(requestId);
      if (response) {
        resolve({ content: response.content, isError: response.isError });
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      setTimeout(check, 500);
    };
    check();
  });
}

const DESTRUCTIVE_PATTERNS = [
  /\brm\s+-[rf]/i,
  /\brm\s+-fr/i,
  /\brm\s+-rf/i,
  /\bmkfs/i,
  /\bdd\s+.*of=\/dev\//i,
  /\bchmod\s+-R\s+777/i,
  /\bchown\s+-R/i,
  /\bsudo\s+rm/i,
  /\bgit\s+push\s+--force/i,
  /\bgit\s+reset\s+--hard/i,
  /\bgit\s+clean\s+-fd/i,
  /\bnpm\s+publish/i,
  /\bdocker\s+system\s+prune/i,
  /\btruncate\s+-s\s+0/i,
];

function requiresApprovalFor(
  toolName: string,
  args: Record<string, unknown>
): boolean {
  if (toolName === "git_commit" || toolName === "delete_file") return true;
  if (toolName === "run_command") {
    const command = (args.command as string) || "";
    return DESTRUCTIVE_PATTERNS.some((p) => p.test(command));
  }
  return false;
}
