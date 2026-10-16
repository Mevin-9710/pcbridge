import { NextRequest, NextResponse } from "next/server";
import { listDevices, createPendingPairing } from "@/lib/device-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const devices = await listDevices();
  return NextResponse.json({ devices });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceName } = body;

    if (!deviceName) {
      return NextResponse.json({ error: "deviceName is required" }, { status: 400 });
    }

    const code = await createPendingPairing(deviceName);

    return NextResponse.json({
      pairingCode: code,
      message: "Enter this code in your PCBridge runner to pair your device",
      expiresIn: "10 minutes",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
