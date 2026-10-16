import { describe, it, expect, beforeEach } from "vitest";
import {
  createPendingPairing,
  validatePairingCode,
  registerDevice,
  getDevice,
  listDevices,
  updateDeviceStatus,
  removeDevice,
} from "../device-registry";
import { __resetStore } from "../store";

describe("Device Registry", () => {
  beforeEach(() => {
    __resetStore();
  });

  it("should create a pending pairing", async () => {
    const code = await createPendingPairing("Test Device");
    expect(code).toBeDefined();
    expect(code).toHaveLength(6);
  });

  it("should validate a pairing code", async () => {
    const code = await createPendingPairing("Test Device");
    expect(await validatePairingCode(code)).toBe(true);
  });

  it("should reject an invalid pairing code", async () => {
    expect(await validatePairingCode("INVALID")).toBe(false);
  });

  it("should register a device", async () => {
    const code = await createPendingPairing("Test Device");
    const device = await registerDevice(code, "Test Device", "linux", "0.1.0");
    expect(device).toBeDefined();
    expect(device?.name).toBe("Test Device");
    expect(device?.status).toBe("online");
  });

  it("should get a device by ID", async () => {
    const code = await createPendingPairing("Test Device");
    const device = await registerDevice(code, "Test Device", "linux", "0.1.0");
    const found = await getDevice(device!.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Test Device");
  });

  it("should list all devices", async () => {
    const code1 = await createPendingPairing("Device 1");
    const code2 = await createPendingPairing("Device 2");
    await registerDevice(code1, "Device 1", "linux", "0.1.0");
    await registerDevice(code2, "Device 2", "macos", "0.1.0");
    const devices = await listDevices();
    expect(devices).toHaveLength(2);
  });

  it("should update device status", async () => {
    const code = await createPendingPairing("Test Device");
    const device = await registerDevice(code, "Test Device", "linux", "0.1.0");
    await updateDeviceStatus(device!.id, "offline");
    const updated = await getDevice(device!.id);
    expect(updated?.status).toBe("offline");
  });

  it("should remove a device", async () => {
    const code = await createPendingPairing("Test Device");
    const device = await registerDevice(code, "Test Device", "linux", "0.1.0");
    const removed = await removeDevice(device!.id);
    expect(removed).toBe(true);
    expect(await getDevice(device!.id)).toBeUndefined();
  });
});
