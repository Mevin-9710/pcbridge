import { Device } from "./types";
import { randomBytes } from "crypto";
import { readState, writeState } from "./store";

const PAIRING_TTL_MS = 10 * 60 * 1000;

export function generatePairingCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

export async function createPendingPairing(deviceName: string): Promise<string> {
  const state = await readState();
  const code = generatePairingCode();
  state.pairingCodes[code] = { createdAt: new Date().toISOString() };
  await writeState(state);
  return code;
}

export async function validatePairingCode(code: string): Promise<boolean> {
  const state = await readState();
  const pairing = state.pairingCodes[code];
  if (!pairing) return false;

  const age = Date.now() - new Date(pairing.createdAt).getTime();
  if (age > PAIRING_TTL_MS) {
    delete state.pairingCodes[code];
    await writeState(state);
    return false;
  }

  return true;
}

export async function registerDevice(
  code: string,
  name: string,
  platform: string,
  version: string
): Promise<Device | null> {
  const state = await readState();
  const pairing = state.pairingCodes[code];
  if (!pairing) return null;

  const age = Date.now() - new Date(pairing.createdAt).getTime();
  if (age > PAIRING_TTL_MS) {
    delete state.pairingCodes[code];
    await writeState(state);
    return null;
  }

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

  state.devices[id] = device;
  delete state.pairingCodes[code];
  await writeState(state);
  return device;
}

export async function getDevice(id: string): Promise<Device | undefined> {
  const state = await readState();
  return state.devices[id];
}

export async function updateDeviceStatus(
  id: string,
  status: "online" | "offline"
): Promise<void> {
  const state = await readState();
  const device = state.devices[id];
  if (device) {
    device.status = status;
    device.lastSeen = new Date().toISOString();
    await writeState(state);
  }
}

export async function updateDeviceLastSeen(id: string): Promise<void> {
  const state = await readState();
  const device = state.devices[id];
  if (device) {
    device.lastSeen = new Date().toISOString();
    await writeState(state);
  }
}

export async function listDevices(): Promise<Device[]> {
  const state = await readState();
  return Object.values(state.devices);
}

export async function removeDevice(id: string): Promise<boolean> {
  const state = await readState();
  if (!state.devices[id]) return false;
  delete state.devices[id];
  await writeState(state);
  return true;
}
