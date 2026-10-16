export interface Device {
  id: string;
  name: string;
  status: "online" | "offline" | "pending";
  pairedAt: string;
  lastSeen: string;
  platform: string;
  version: string;
}

export interface ToolRequest {
  id: string;
  deviceId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  timestamp: string;
  status: "pending" | "approved" | "denied" | "completed" | "failed";
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ToolResponse {
  requestId: string;
  deviceId: string;
  content: Array<{ type: string; text: string }>;
  isError: boolean;
  timestamp: string;
}

export interface PendingRequest {
  requestId: string;
  deviceId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  requiresApproval: boolean;
  approved: boolean;
  timestamp: string;
}

export interface RunnerConfig {
  deviceId: string;
  apiUrl: string;
  pollInterval: number;
  projectDir: string;
  requireApproval: boolean;
  allowedCommands: string[];
  deniedCommands: string[];
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>, deviceId: string) => Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }>;
}

export interface McpMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
