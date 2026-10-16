import { NextRequest, NextResponse } from "next/server";
import { getDevice, updateDeviceStatus, removeDevice } from "@/lib/device-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { deviceId: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const device = await getDevice(params.deviceId);
  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }
  return NextResponse.json({ device });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const device = await getDevice(params.deviceId);
  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    if (body.status) {
      await updateDeviceStatus(params.deviceId, body.status);
    }
    return NextResponse.json({ device: await getDevice(params.deviceId) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const removed = await removeDevice(params.deviceId);
  if (!removed) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Device removed" });
}
