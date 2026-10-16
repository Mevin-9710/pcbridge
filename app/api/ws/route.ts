import { NextRequest } from "next/server";
import { getDevice, updateDeviceLastSeen } from "@/lib/device-registry";
import { getPendingRequests, submitResponse } from "@/lib/request-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");

  if (!deviceId) {
    return new Response("deviceId is required", { status: 400 });
  }

  const device = getDevice(deviceId);
  if (!device) {
    return new Response("Device not found", { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendPendingRequests = () => {
        const pending = getPendingRequests(deviceId);
        if (pending.length > 0) {
          for (const req of pending) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "request",
                  requestId: req.requestId,
                  toolName: req.toolName,
                  arguments: req.arguments,
                }) + "\n"
              )
            );
          }
        }
      };

      sendPendingRequests();
      const interval = setInterval(() => {
        try {
          updateDeviceLastSeen(deviceId);
          sendPendingRequests();
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
