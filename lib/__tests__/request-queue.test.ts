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
import { __resetStore } from "../store";

describe("Request Queue", () => {
  const deviceId = "test-device-id";

  beforeEach(() => {
    __resetStore();
  });

  it("should create a request", async () => {
    const request = await createRequest(deviceId, "read_file", { path: "/test" });
    expect(request).toBeDefined();
    expect(request.toolName).toBe("read_file");
    expect(request.status).toBe("pending");
  });

  it("should get a request by ID", async () => {
    const request = await createRequest(deviceId, "read_file", { path: "/test" });
    const found = await getRequest(request.id);
    expect(found).toBeDefined();
    expect(found?.toolName).toBe("read_file");
  });

  it("should queue non-approval requests immediately as approved", async () => {
    await createRequest(deviceId, "read_file", { path: "/test" });
    const pending = await getPendingRequests(deviceId);
    expect(pending.length).toBe(1);
    expect(pending[0].approved).toBe(true);
  });

  it("should not queue approval-required requests until approved", async () => {
    const request = await createRequest(
      deviceId,
      "run_command",
      { command: "rm -rf /" },
      true
    );
    expect((await getPendingRequests(deviceId)).length).toBe(0);

    await approveRequest(request.id, "user");
    const pending = await getPendingRequests(deviceId);
    expect(pending.length).toBe(1);
    expect(pending[0].approved).toBe(true);
  });

  it("should submit a response", async () => {
    const request = await createRequest(deviceId, "read_file", { path: "/test" });
    await submitResponse(request.id, deviceId, [{ type: "text", text: "file content" }], false);
    const response = await getResponse(request.id);
    expect(response).toBeDefined();
    expect(response?.content[0].text).toBe("file content");
  });

  it("should approve a request", async () => {
    const request = await createRequest(
      deviceId,
      "run_command",
      { command: "rm -rf /" },
      true
    );
    const approved = await approveRequest(request.id, "user");
    expect(approved).toBe(true);
    const updated = await getRequest(request.id);
    expect(updated?.status).toBe("approved");
  });

  it("should deny a request", async () => {
    const request = await createRequest(
      deviceId,
      "run_command",
      { command: "rm -rf /" },
      true
    );
    const denied = await denyRequest(request.id);
    expect(denied).toBe(true);
    const updated = await getRequest(request.id);
    expect(updated?.status).toBe("denied");
  });

  it("should get pending approvals", async () => {
    await createRequest(deviceId, "run_command", { command: "rm -rf /" }, true);
    const approvals = await getPendingApprovals();
    expect(approvals.length).toBeGreaterThan(0);
  });
});
