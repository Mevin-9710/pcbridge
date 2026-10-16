import { ToolRequest, ToolResponse, PendingRequest } from "./types";
import { randomBytes } from "crypto";
import { getDevice } from "./device-registry";

interface QueueState {
  requests: Map<string, ToolRequest>;
  responses: Map<string, ToolResponse>;
  pendingByDevice: Map<string, PendingRequest[]>;
}

function getState(): QueueState {
  const g = globalThis as typeof globalThis & { __pcbridgeQueue?: QueueState };
  if (!g.__pcbridgeQueue) {
    g.__pcbridgeQueue = {
      requests: new Map(),
      responses: new Map(),
      pendingByDevice: new Map(),
    };
  }
  return g.__pcbridgeQueue;
}

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

  getState().requests.set(id, request);

  if (!requiresApproval) {
    const pending = getState().pendingByDevice.get(deviceId) || [];
    pending.push({
      requestId: id,
      deviceId,
      toolName,
      arguments: args,
      requiresApproval,
      approved: true,
      timestamp: request.timestamp,
    });
    getState().pendingByDevice.set(deviceId, pending);
  }

  return request;
}

export function getRequest(id: string): ToolRequest | undefined {
  return getState().requests.get(id);
}

export function getPendingRequests(deviceId: string): PendingRequest[] {
  return getState().pendingByDevice.get(deviceId) || [];
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

  getState().responses.set(requestId, response);

  const request = getState().requests.get(requestId);
  if (request) {
    request.status = isError ? "failed" : "completed";
  }

  const pending = getState().pendingByDevice.get(deviceId) || [];
  const idx = pending.findIndex((p) => p.requestId === requestId);
  if (idx !== -1) {
    pending.splice(idx, 1);
    getState().pendingByDevice.set(deviceId, pending);
  }
}

export function getResponse(requestId: string): ToolResponse | undefined {
  return getState().responses.get(requestId);
}

export function approveRequest(requestId: string, approvedBy: string): boolean {
  const request = getState().requests.get(requestId);
  if (!request || request.status !== "pending") return false;

  request.status = "approved";
  request.approvedBy = approvedBy;
  request.approvedAt = new Date().toISOString();

  const pending = getState().pendingByDevice.get(request.deviceId) || [];
  pending.push({
    requestId: request.id,
    deviceId: request.deviceId,
    toolName: request.toolName,
    arguments: request.arguments,
    requiresApproval: request.requiresApproval,
    approved: true,
    timestamp: request.timestamp,
  });
  getState().pendingByDevice.set(request.deviceId, pending);

  return true;
}

export function denyRequest(requestId: string): boolean {
  const request = getState().requests.get(requestId);
  if (!request || request.status !== "pending") return false;

  submitResponse(
    requestId,
    request.deviceId,
    [{ type: "text", text: "Request denied by user" }],
    true
  );
  request.status = "denied";
  return true;
}

export function getRequestsForDevice(deviceId: string): ToolRequest[] {
  return Array.from(getState().requests.values()).filter((r) => r.deviceId === deviceId);
}

export function getPendingApprovals(): ToolRequest[] {
  return Array.from(getState().requests.values()).filter(
    (r) => r.requiresApproval && r.status === "pending"
  );
}
