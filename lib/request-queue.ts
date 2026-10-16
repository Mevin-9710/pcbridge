import { ToolRequest, ToolResponse, PendingRequest } from "./types";
import { randomBytes } from "crypto";
import { getDevice } from "./device-registry";

const requests = new Map<string, ToolRequest>();
const responses = new Map<string, ToolResponse>();
const pendingByDevice = new Map<string, PendingRequest[]>();

export function createRequest(
  deviceId: string,
  toolName: string,
  args: Record<string, unknown>,
  requiresApproval: boolean = false
): ToolRequest {
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

  requests.set(id, request);

  if (requiresApproval) {
    const pending = pendingByDevice.get(deviceId) || [];
    pending.push({
      requestId: id,
      deviceId,
      toolName,
      arguments: args,
      requiresApproval,
      timestamp: request.timestamp,
    });
    pendingByDevice.set(deviceId, pending);
  }

  return request;
}

export function getRequest(id: string): ToolRequest | undefined {
  return requests.get(id);
}

export function getPendingRequests(deviceId: string): PendingRequest[] {
  return pendingByDevice.get(deviceId) || [];
}

export function submitResponse(
  requestId: string,
  deviceId: string,
  content: Array<{ type: string; text: string }>,
  isError: boolean = false
): void {
  const response: ToolResponse = {
    requestId,
    deviceId,
    content,
    isError,
    timestamp: new Date().toISOString(),
  };

  responses.set(requestId, response);

  const request = requests.get(requestId);
  if (request) {
    request.status = isError ? "failed" : "completed";
  }

  const pending = pendingByDevice.get(deviceId) || [];
  const idx = pending.findIndex((p) => p.requestId === requestId);
  if (idx !== -1) {
    pending.splice(idx, 1);
    pendingByDevice.set(deviceId, pending);
  }
}

export function getResponse(requestId: string): ToolResponse | undefined {
  return responses.get(requestId);
}

export function approveRequest(requestId: string, approvedBy: string): boolean {
  const request = requests.get(requestId);
  if (!request || request.status !== "pending") return false;

  request.status = "approved";
  request.approvedBy = approvedBy;
  request.approvedAt = new Date().toISOString();
  return true;
}

export function denyRequest(requestId: string): boolean {
  const request = requests.get(requestId);
  if (!request || request.status !== "pending") return false;

  request.status = "denied";
  return true;
}

export function getRequestsForDevice(deviceId: string): ToolRequest[] {
  return Array.from(requests.values()).filter((r) => r.deviceId === deviceId);
}

export function getPendingApprovals(): ToolRequest[] {
  return Array.from(requests.values()).filter(
    (r) => r.requiresApproval && r.status === "pending"
  );
}
