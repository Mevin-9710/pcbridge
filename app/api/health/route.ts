import { NextResponse } from "next/server";
import { listDevices } from "@/lib/device-registry";
import { getPendingApprovals } from "@/lib/request-queue";
import { sharedStoreEnabled } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const devices = await listDevices();
  const pendingApprovals = await getPendingApprovals();

  return NextResponse.json({
    status: "healthy",
    version: "0.1.0",
    storage: sharedStoreEnabled ? "shared" : "in-memory",
    timestamp: new Date().toISOString(),
    stats: {
      totalDevices: devices.length,
      onlineDevices: devices.filter((d) => d.status === "online").length,
      pendingApprovals: pendingApprovals.length,
    },
  });
}
