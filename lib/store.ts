import { Device, ToolRequest, ToolResponse } from "./types";

export interface StoreState {
  devices: Record<string, Device>;
  pairingCodes: Record<string, { createdAt: string }>;
  requests: Record<string, ToolRequest>;
  responses: Record<string, ToolResponse>;
}

const STATE_KEY = "pcbridge:state";

const kvUrl =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const kvToken =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const sharedStoreEnabled = Boolean(kvUrl && kvToken);

function emptyState(): StoreState {
  return { devices: {}, pairingCodes: {}, requests: {}, responses: {} };
}

function getMemory(): StoreState {
  const g = globalThis as typeof globalThis & { __pcbridgeStore?: StoreState };
  if (!g.__pcbridgeStore) {
    g.__pcbridgeStore = emptyState();
  }
  return g.__pcbridgeStore;
}

export function __resetStore(): void {
  delete (globalThis as typeof globalThis & { __pcbridgeStore?: StoreState }).__pcbridgeStore;
}

async function redisCommand(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(kvUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Shared store command failed: ${res.status}`);
  }
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

function prune(state: StoreState): void {
  const cutoff = Date.now() - 10 * 60 * 1000;

  for (const [id, response] of Object.entries(state.responses)) {
    if (new Date(response.timestamp).getTime() < cutoff) {
      delete state.responses[id];
    }
  }

  for (const [id, req] of Object.entries(state.requests)) {
    const terminal =
      req.status === "completed" || req.status === "failed" || req.status === "denied";
    if (terminal && new Date(req.timestamp).getTime() < cutoff) {
      delete state.requests[id];
      delete state.responses[id];
    }
  }
}

export async function readState(): Promise<StoreState> {
  if (!sharedStoreEnabled) {
    return getMemory();
  }

  const raw = (await redisCommand(["GET", STATE_KEY])) as string | null;
  if (!raw) return emptyState();

  try {
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export async function writeState(state: StoreState): Promise<void> {
  prune(state);

  if (!sharedStoreEnabled) {
    (globalThis as typeof globalThis & { __pcbridgeStore?: StoreState }).__pcbridgeStore =
      state;
    return;
  }

  await redisCommand(["SET", STATE_KEY, JSON.stringify(state)]);
}
