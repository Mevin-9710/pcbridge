import { NextRequest, NextResponse } from "next/server";
import { getDevice } from "@/lib/device-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");

  if (!deviceId) {
    return NextResponse.json(
      { error: "deviceId is required" },
      { status: 400 }
    );
  }

  const device = await getDevice(deviceId);
  if (!device) {
    return NextResponse.json(
      { error: "Device not found" },
      { status: 404 }
    );
  }

  const baseUrl = new URL(request.url).origin;

  const claudeDesktopConfig = {
    mcpServers: {
      pcbridge: {
        url: `${baseUrl}/api/mcp`,
        headers: {
          "X-Device-Id": deviceId,
        },
      },
    },
  };

  const cursorConfig = {
    mcpServers: {
      pcbridge: {
        url: `${baseUrl}/api/mcp`,
        headers: {
          "X-Device-Id": deviceId,
        },
      },
    },
  };

  const vscodeConfig = {
    mcp: {
      servers: {
        pcbridge: {
          type: "http",
          url: `${baseUrl}/api/mcp`,
          headers: {
            "X-Device-Id": deviceId,
          },
        },
      },
    },
  };

  return NextResponse.json({
    deviceId,
    deviceName: device.name,
    status: device.status,
    configs: {
      claudeDesktop: claudeDesktopConfig,
      cursor: cursorConfig,
      vscode: vscodeConfig,
    },
  });
}
