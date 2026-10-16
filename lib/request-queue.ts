import { ToolRequest, ToolResponse, PendingRequest } from "./types";
import { randomBytes } from "crypto";
import { readState, writeState } from "./store";

export async function createRequest(
  deviceId: string,
  toolName: string,
  args: Record<string, unknown>,
  requiresApproval: boolean = false
): Promise<ToolRequest> {
  const state = await readState();
  const id = randomBytes(16).toString("hex");
  const request: ToolRequest = {
    id,
    deviceId,
    toolName,
    arguments: args,
    timestamp: new Date().toISOString(),
    status: "pending",
    requiresApproval,
  };

  state.requests[id] = request;
  await writeState(state);
  return request;
}

export async function getRequest(id: string): Promise<ToolRequest | undefined> {
  const state = await readState();
  return state.requests[id];
}

export async function getPendingRequests(deviceId: string): Promise<PendingRequest[]> {
  const state = await readState();
  return Object.values(state.requests)
    .filter(
      (r) =>
        r.deviceId === deviceId &&
        ((r.status === "pending" && !r.requiresApproval) || r.status === "approved")
    )
    .map((r) => ({
      requestId: r.id,
      deviceId: r.deviceId,
      toolName: r.toolName,
      arguments: r.arguments,
      requiresApproval: r.requiresApproval,
      approved: true,
      timestamp: r.timestamp,
    }));
}

export async function submitResponse(
  requestId: string,
  deviceId: string,
  content: Array<{ type: string; text: string }>,
  isError: boolean = false
): Promise<void> {
  const state = await readState();

  state.responses[requestId] = {
    requestId,
    deviceId,
    content,
    isError,
    timestamp: new Date().toISOString(),
  };

  const request = state.requests[requestId];
  if (request) {
    request.status = isError ? "failed" : "completed";
  }

  await writeState(state);
}

export async function getResponse(requestId: string): Promise<ToolResponse | undefined> {
  const state = await readState();
  return state.responses[requestId];
}

export async function approveRequest(
  requestId: string,
  approvedBy: string
): Promise<boolean> {
  const state = await readState();
  const request = state.requests[requestId];
  if (!request || request.status !== "pending") return false;

  request.status = "approved";
  request.approvedBy = approvedBy;
  request.approvedAt = new Date().toISOString();

  await writeState(state);
  return true;
}

export async function denyRequest(requestId: string): Promise<boolean> {
  const state = await readState();
  const request = state.requests[requestId];
  if (!request || request.status !== "pending") return false;

  state.responses[requestId] = {
    requestId,
    deviceId: request.deviceId,
    content: [{ type: "text", text: "Request denied by user" }],
    isError: true,
    timestamp: new Date().toISOString(),
  };
  request.status = "denied";

  await writeState(state);
  return true;
}

export async function getRequestsForDevice(deviceId: string): Promise<ToolRequest[]> {
  const state = await readState();
  return Object.values(state.requests).filter((r) => r.deviceId === deviceId);
}

export async function getPendingApprovals(): Promise<ToolRequest[]> {
  const state = await readState();
  return Object.values(state.requests).filter(
    (r) => r.requiresApproval && r.status === "pending"
  );
}
