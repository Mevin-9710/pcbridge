import { Device } from "./types";
import { randomBytes } from "crypto";

interface RegistryState {
  devices: Map<string, Device>;
  pendingPairings: Map<string, { code: string; createdAt: string }>;
}

function getState(): RegistryState {
  const g = globalThis as typeof globalThis & { __pcbridgeRegistry?: RegistryState };
  if (!g.__pcbridgeRegistry) {
    g.__pcbridgeRegistry = {
      devices: new Map(),
      pendingPairings: new Map(),
    };
  }
  return g.__pcbridgeRegistry;
}

export function generatePairingCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

export function createPendingPairing(deviceName: string): string {
  const code = generatePairingCode();
  getState().pendingPairings.set(code, {
    code,
    createdAt: new Date().toISOString(),
  });
  return code;
}

export function validatePairingCode(code: string): boolean {
  const pairing = getState().pendingPairings.get(code);
  if (!pairing) return false;

  const age = Date.now() - new Date(pairing.createdAt).getTime();
  if (age > 10 * 60 * 1000) {
    getState().pendingPairings.delete(code);
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

  getState().devices.set(id, device);
  getState().pendingPairings.delete(code);
  return device;
}

export function getDevice(id: string): Device | undefined {
  return getState().devices.get(id);
}

export function updateDeviceStatus(
  id: string,
  status: "online" | "offline"
): void {
  const device = getState().devices.get(id);
  if (device) {
    device.status = status;
    device.lastSeen = new Date().toISOString();
  }
}

export function updateDeviceLastSeen(id: string): void {
  const device = getState().devices.get(id);
  if (device) {
    device.lastSeen = new Date().toISOString();
  }
}

export function listDevices(): Device[] {
  return Array.from(getState().devices.values());
}

export function removeDevice(id: string): boolean {
  return getState().devices.delete(id);
}
