import { Tool } from "../types";
import { getDevice } from "../device-registry";

export const getStatusTool: Tool = {
  name: "get_status",
  description: "Get the status of the connected computer and PCBridge runner",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async (_args, deviceId) => {
    const device = await getDevice(deviceId);
    if (!device) {
      return {
        content: [{ type: "text", text: "Device not found" }],
        isError: true,
      };
    }

    const status = {
      deviceId: device.id,
      name: device.name,
      status: device.status,
      platform: device.platform,
      version: device.version,
      pairedAt: device.pairedAt,
      lastSeen: device.lastSeen,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
      isError: false,
    };
  },
};
