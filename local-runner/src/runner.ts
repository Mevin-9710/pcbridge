import chalk from "chalk";
import { RunnerConfig, ConfigManager } from "./config";
import { ToolExecutor } from "./executor";
import { WebSocketClient } from "./websocket-client";
import fetch from "node-fetch";

export class Runner {
  private config: RunnerConfig;
  private executor: ToolExecutor;
  private wsClient: WebSocketClient | null = null;
  private running = false;
  private pollInterval = 2000;
  private useWebSocket = true;

  constructor(config: RunnerConfig) {
    this.config = config;
    this.executor = new ToolExecutor(config);
  }

  async start(): Promise<void> {
    const existingConfig = ConfigManager.load();

    if (existingConfig?.deviceId) {
      this.config.deviceId = existingConfig.deviceId;
      this.config.platform = existingConfig.platform;
      this.config.version = existingConfig.version;
      console.log(chalk.green("Using existing device ID:"), this.config.deviceId);
    } else if (this.config.pairingCode) {
      console.log(chalk.yellow("Pairing device..."));
      const device = await this.pairDevice(this.config.pairingCode);
      if (device) {
        this.config.deviceId = device.id;
        this.config.platform = device.platform;
        this.config.version = device.version;
        ConfigManager.save(this.config);
        console.log(chalk.green("Paired successfully! Device ID:"), device.id);
      } else {
        throw new Error("Failed to pair device. Check your pairing code.");
      }
    } else {
      throw new Error("No device ID or pairing code provided. Run with --code <pairing-code>");
    }

    console.log();
    console.log(chalk.green("Connected!"));
    console.log(chalk.gray("Device ID:"), this.config.deviceId);
    console.log(chalk.gray("Mode:"), this.useWebSocket ? "WebSocket" : "HTTP Polling");
    console.log();
    console.log(chalk.gray("Press Ctrl+C to stop"));
    console.log();

    this.running = true;

    if (this.useWebSocket) {
      this.wsClient = new WebSocketClient(this.config);
      await this.wsClient.connect();
    } else {
      this.poll();
    }
  }

  private async pairDevice(code: string): Promise<{ id: string; platform: string; version: string } | null> {
    try {
      const res = await fetch(`${this.config.apiUrl}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pair",
          code,
          deviceName: this.config.deviceName,
          platform: process.platform,
          version: "0.1.0",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Pairing failed");
      }

      const data = await res.json();
      return data.device;
    } catch (error) {
      console.error(chalk.red("Pairing error:"), error instanceof Error ? error.message : error);
      return null;
    }
  }

  private async poll(): Promise<void> {
    while (this.running) {
      try {
        await this.checkForRequests();
      } catch (error) {
        if (this.running) {
          console.error(chalk.red("Poll error:"), error instanceof Error ? error.message : error);
        }
      }

      await this.sleep(this.pollInterval);
    }
  }

  private async checkForRequests(): Promise<void> {
    if (!this.config.deviceId) return;

    const res = await fetch(
      `${this.config.apiUrl}/api/requests?deviceId=${this.config.deviceId}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) return;

    const data = await res.json();
    const pending = data.pending || [];

    for (const request of pending) {
      await this.handleRequest(request);
    }
  }

  private async handleRequest(request: {
    requestId: string;
    toolName: string;
    arguments: Record<string, unknown>;
  }): Promise<void> {
    const { requestId, toolName, args } = request;

    console.log(chalk.blue("Executing:"), toolName, JSON.stringify(args).slice(0, 80));

    try {
      const result = await this.executor.execute(toolName, args);

      await fetch(`${this.config.apiUrl}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "response",
          requestId,
          deviceId: this.config.deviceId,
          content: result.content,
          isError: result.isError,
        }),
      });

      if (result.isError) {
        console.log(chalk.red("Error:"), result.content[0]?.text?.slice(0, 100));
      } else {
        console.log(chalk.green("Done"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await fetch(`${this.config.apiUrl}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "response",
          requestId,
          deviceId: this.config.deviceId,
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        }),
      });

      console.log(chalk.red("Error:"), message);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stop(): void {
    this.running = false;
    this.wsClient?.disconnect();
  }
}
