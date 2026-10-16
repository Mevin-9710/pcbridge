import { Device } from "./types";
import { randomBytes } from "crypto";

const devices = new Map<string, Device>();
const pendingPairings = new Map<string, { code: string; createdAt: string }>();

export function generatePairingCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

export function createPendingPairing(deviceName: string): string {
  const code = generatePairingCode();
  pendingPairings.set(code, {
    code,
    createdAt: new Date().toISOString(),
  });
  return code;
}

export function validatePairingCode(code: string): boolean {
  const pairing = pendingPairings.get(code);
  if (!pairing) return false;

  const age = Date.now() - new Date(pairing.createdAt).getTime();
  if (age > 10 * 60 * 1000) {
    pendingPairings.delete(code);
    return false;
  }

  return true;
}

export function registerDevice(
  code: string,
  name: string,
  platform: string,
  version: string
): Device | null {
  if (!validatePairingCode(code)) return null;

  const id = randomBytes(16).toString("hex");
  const device: Device = {
    id,
    name,
    status: "online",
    pairedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    platform,
    version,
  };

  devices.set(id, device);
  pendingPairings.delete(code);
  return device;
}

export function getDevice(id: string): Device | undefined {
  return devices.get(id);
}

export function updateDeviceStatus(
  id: string,
  status: "online" | "offline"
): void {
  const device = devices.get(id);
  if (device) {
    device.status = status;
    device.lastSeen = new Date().toISOString();
  }
}

export function updateDeviceLastSeen(id: string): void {
  const device = devices.get(id);
  if (device) {
    device.lastSeen = new Date().toISOString();
  }
}

export function listDevices(): Device[] {
  return Array.from(devices.values());
}

export function removeDevice(id: string): boolean {
  return devices.delete(id);
}
