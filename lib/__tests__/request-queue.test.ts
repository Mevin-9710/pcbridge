import { describe, it, expect, beforeEach } from "vitest";
import {
  createRequest,
  getRequest,
  getPendingRequests,
  submitResponse,
  getResponse,
  approveRequest,
  denyRequest,
  getPendingApprovals,
} from "../request-queue";

describe("Request Queue", () => {
  const deviceId = "test-device-id";

  beforeEach(() => {
    delete (globalThis as { __pcbridgeQueue?: unknown }).__pcbridgeQueue;
  });

  it("should create a request", () => {
    const request = createRequest(deviceId, "read_file", { path: "/test" });
    expect(request).toBeDefined();
    expect(request.toolName).toBe("read_file");
    expect(request.status).toBe("pending");
  });

  it("should queue non-approval requests immediately as approved", () => {
    createRequest(deviceId, "read_file", { path: "/test" });
    const pending = getPendingRequests(deviceId);
    expect(pending.length).toBe(1);
    expect(pending[0].approved).toBe(true);
  });

  it("should not queue approval-required requests until approved", () => {
    const request = createRequest(deviceId, "run_command", { command: "rm -rf /" }, true);
    expect(getPendingRequests(deviceId).length).toBe(0);

    approveRequest(request.id, "user");
    const pending = getPendingRequests(deviceId);
    expect(pending.length).toBe(1);
    expect(pending[0].approved).toBe(true);
  });

  it("should get a request by ID", () => {
    const request = createRequest(deviceId, "read_file", { path: "/test" });
    const found = getRequest(request.id);
    expect(found).toBeDefined();
    expect(found?.toolName).toBe("read_file");
  });

  it("should get pending requests for a device", () => {
    createRequest(deviceId, "read_file", { path: "/test" });
    const pending = getPendingRequests(deviceId);
    expect(pending.length).toBeGreaterThan(0);
  });

  it("should submit a response", () => {
    const request = createRequest(deviceId, "read_file", { path: "/test" });
    submitResponse(request.id, deviceId, [{ type: "text", text: "file content" }], false);
    const response = getResponse(request.id);
    expect(response).toBeDefined();
    expect(response?.content[0].text).toBe("file content");
  });

  it("should approve a request", () => {
    const request = createRequest(deviceId, "run_command", { command: "rm -rf /" }, true);
    const approved = approveRequest(request.id, "user");
    expect(approved).toBe(true);
    const updated = getRequest(request.id);
    expect(updated?.status).toBe("approved");
  });

  it("should deny a request", () => {
    const request = createRequest(deviceId, "run_command", { command: "rm -rf /" }, true);
    const denied = denyRequest(request.id);
    expect(denied).toBe(true);
    const updated = getRequest(request.id);
    expect(updated?.status).toBe("denied");
  });

  it("should get pending approvals", () => {
    createRequest(deviceId, "run_command", { command: "rm -rf /" }, true);
    const approvals = getPendingApprovals();
    expect(approvals.length).toBeGreaterThan(0);
  });
});
