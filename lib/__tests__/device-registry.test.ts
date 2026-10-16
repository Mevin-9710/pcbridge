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

describe("Device Registry", () => {
  beforeEach(() => {
    // Clear state between tests
    listDevices().forEach((d) => removeDevice(d.id));
  });

  it("should create a pending pairing", () => {
    const code = createPendingPairing("Test Device");
    expect(code).toBeDefined();
    expect(code).toHaveLength(6);
  });

  it("should validate a pairing code", () => {
    const code = createPendingPairing("Test Device");
    expect(validatePairingCode(code)).toBe(true);
  });

  it("should reject an invalid pairing code", () => {
    expect(validatePairingCode("INVALID")).toBe(false);
  });

  it("should register a device", () => {
    const code = createPendingPairing("Test Device");
    const device = registerDevice(code, "Test Device", "linux", "0.1.0");
    expect(device).toBeDefined();
    expect(device?.name).toBe("Test Device");
    expect(device?.status).toBe("online");
  });

  it("should get a device by ID", () => {
    const code = createPendingPairing("Test Device");
    const device = registerDevice(code, "Test Device", "linux", "0.1.0");
    const found = getDevice(device!.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Test Device");
  });

  it("should list all devices", () => {
    const code1 = createPendingPairing("Device 1");
    const code2 = createPendingPairing("Device 2");
    registerDevice(code1, "Device 1", "linux", "0.1.0");
    registerDevice(code2, "Device 2", "macos", "0.1.0");
    const devices = listDevices();
    expect(devices).toHaveLength(2);
  });

  it("should update device status", () => {
    const code = createPendingPairing("Test Device");
    const device = registerDevice(code, "Test Device", "linux", "0.1.0");
    updateDeviceStatus(device!.id, "offline");
    const updated = getDevice(device!.id);
    expect(updated?.status).toBe("offline");
  });

  it("should remove a device", () => {
    const code = createPendingPairing("Test Device");
    const device = registerDevice(code, "Test Device", "linux", "0.1.0");
    const removed = removeDevice(device!.id);
    expect(removed).toBe(true);
    expect(getDevice(device!.id)).toBeUndefined();
  });
});
