#!/usr/bin/env npx ts-node

import fetch from "node-fetch";

const API_URL = process.env.PCBRIDGE_API_URL || "http://localhost:3000";

async function pairDevice() {
  const code = process.argv[2];
  const deviceName = process.argv[3] || "Test Device";

  if (!code) {
    console.error("Usage: npx ts-node scripts/pair-device.ts <code> [device-name]");
    process.exit(1);
  }

  console.log("Pairing device...\n");

  const res = await fetch(`${API_URL}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "pair",
      code,
      deviceName,
      platform: process.platform,
      version: "0.1.0",
    }),
  });

  const data = await res.json();

  if (data.device) {
    console.log("Paired successfully!");
    console.log("Device ID:", data.device.id);
    console.log("Device Name:", data.device.name);
    console.log("\nUse this device ID in your MCP configuration:");
    console.log(`  "X-Device-Id": "${data.device.id}"`);
  } else {
    console.error("Pairing failed:", data.error);
    process.exit(1);
  }
}

pairDevice().catch(console.error);
