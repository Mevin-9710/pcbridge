#!/usr/bin/env npx ts-node

import fetch from "node-fetch";

const API_URL = process.env.PCBRIDGE_API_URL || "http://localhost:3000";
const DEVICE_ID = process.env.PCBRIDGE_DEVICE_ID || "";

async function testMcp() {
  console.log("Testing PCBridge MCP endpoint...\n");

  // Test initialize
  console.log("1. Testing initialize...");
  const initRes = await fetch(`${API_URL}/api/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": DEVICE_ID,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "0.1.0" },
      },
    }),
  });
  const initData = await initRes.json();
  console.log("   Result:", JSON.stringify(initData.result, null, 2));

  // Test tools/list
  console.log("\n2. Testing tools/list...");
  const listRes = await fetch(`${API_URL}/api/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": DEVICE_ID,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    }),
  });
  const listData = await listRes.json();
  console.log("   Tools:", listData.result.tools.map((t: { name: string }) => t.name).join(", "));

  // Test tools/call (get_status)
  console.log("\n3. Testing tools/call (get_status)...");
  const callRes = await fetch(`${API_URL}/api/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": DEVICE_ID,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_status",
        arguments: {},
      },
    }),
  });
  const callData = await callRes.json();
  console.log("   Result:", callData.result.content[0].text);

  console.log("\n✓ All tests passed!");
}

testMcp().catch(console.error);
