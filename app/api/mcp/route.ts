import { NextRequest, NextResponse } from "next/server";
import { listTools, executeTool } from "@/lib/mcp-server";
import { getDevice } from "@/lib/device-registry";
import { randomBytes } from "crypto";
import { registerAllTools } from "@/lib/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let toolsRegistered = false;

function ensureToolsRegistered() {
  if (!toolsRegistered) {
    registerAllTools();
    toolsRegistered = true;
  }
}

function generateDeviceId(): string {
  return randomBytes(16).toString("hex");
}

export async function POST(request: NextRequest) {
  ensureToolsRegistered();

  try {
    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== "2.0") {
      return NextResponse.json(
        { jsonrpc: "2.0", id: id || null, error: { code: -32600, message: "Invalid Request" } },
        { status: 400 }
      );
    }

    const deviceId = request.headers.get("X-Device-Id") || generateDeviceId();
    const device = getDevice(deviceId);

    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "pcbridge",
            version: "0.1.0",
          },
        },
      });
    }

    if (method === "notifications/initialized") {
      return new NextResponse(null, { status: 202 });
    }

    if (method === "tools/list") {
      const tools = listTools();
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { tools },
      });
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params || {};

      if (!name) {
        return NextResponse.json(
          { jsonrpc: "2.0", id, error: { code: -32602, message: "Missing tool name" } },
          { status: 400 }
        );
      }

      if (!device) {
        return NextResponse.json(
          { jsonrpc: "2.0", id, error: { code: -32001, message: "Device not registered. Please pair your device first." } },
          { status: 401 }
        );
      }

      if (device.status !== "online") {
        return NextResponse.json(
          { jsonrpc: "2.0", id, error: { code: -32002, message: "Device is offline" } },
          { status: 400 }
        );
      }

      const result = await executeTool(name, args || {}, deviceId);

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: result.content,
          isError: result.isError,
        },
      });
    }

    return NextResponse.json(
      { jsonrpc: "2.0", id: id || null, error: { code: -32601, message: "Method not found" } },
      { status: 404 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32603, message } },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST for MCP requests." },
    { status: 405 }
  );
}
