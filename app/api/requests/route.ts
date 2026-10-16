import { NextRequest, NextResponse } from "next/server";
import {
  getPendingRequests,
  getResponse,
  submitResponse,
  approveRequest,
  denyRequest,
  getPendingApprovals,
} from "@/lib/request-queue";
import { registerDevice, validatePairingCode, getDevice } from "@/lib/device-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");

  if (!deviceId) {
    const approvals = getPendingApprovals();
    return NextResponse.json({ pendingApprovals: approvals });
  }

  const pending = getPendingRequests(deviceId);
  return NextResponse.json({ pending });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "pair") {
      const { code, deviceName, platform, version } = body;
      if (!code || !deviceName) {
        return NextResponse.json(
          { error: "code and deviceName are required" },
          { status: 400 }
        );
      }

      if (!validatePairingCode(code)) {
        return NextResponse.json(
          { error: "Invalid or expired pairing code" },
          { status: 400 }
        );
      }

      const device = registerDevice(
        code,
        deviceName,
        platform || "unknown",
        version || "unknown"
      );

      if (!device) {
        return NextResponse.json(
          { error: "Failed to register device" },
          { status: 400 }
        );
      }

      return NextResponse.json({ device });
    }

    if (action === "response") {
      const { requestId, deviceId, content, isError } = body;
      if (!requestId || !deviceId) {
        return NextResponse.json(
          { error: "requestId and deviceId are required" },
          { status: 400 }
        );
      }

      submitResponse(requestId, deviceId, content, isError || false);
      return NextResponse.json({ message: "Response submitted" });
    }

    if (action === "approve") {
      const { requestId, approvedBy } = body;
      if (!requestId) {
        return NextResponse.json(
          { error: "requestId is required" },
          { status: 400 }
        );
      }

      const approved = approveRequest(requestId, approvedBy || "user");
      if (!approved) {
        return NextResponse.json(
          { error: "Request not found or already processed" },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: "Request approved" });
    }

    if (action === "deny") {
      const { requestId } = body;
      if (!requestId) {
        return NextResponse.json(
          { error: "requestId is required" },
          { status: 400 }
        );
      }

      const denied = denyRequest(requestId);
      if (!denied) {
        return NextResponse.json(
          { error: "Request not found or already processed" },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: "Request denied" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
