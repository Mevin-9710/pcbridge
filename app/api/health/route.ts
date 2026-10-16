import { NextResponse } from "next/server";
import { listDevices } from "@/lib/device-registry";
import { getPendingApprovals } from "@/lib/request-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const devices = listDevices();
  const pendingApprovals = getPendingApprovals();

  return NextResponse.json({
    status: "healthy",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    stats: {
      totalDevices: devices.length,
      onlineDevices: devices.filter((d) => d.status === "online").length,
      pendingApprovals: pendingApprovals.length,
    },
  });
}
