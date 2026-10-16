import WebSocket from "ws";
import fetch from "node-fetch";
import { RunnerConfig } from "./config";
import { ToolExecutor } from "./executor";
import chalk from "chalk";

export class WebSocketClient {
  private config: RunnerConfig;
  private executor: ToolExecutor;
  private ws: WebSocket | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private running = false;

  constructor(config: RunnerConfig) {
    this.config = config;
    this.executor = new ToolExecutor(config);
  }

  async connect(): Promise<void> {
    if (!this.config.deviceId) {
      throw new Error("Device ID is required for WebSocket connection");
    }

    this.running = true;
    this.connectWs();
  }

  private connectWs(): void {
    const wsUrl = `${this.config.apiUrl.replace("https://", "wss://").replace("http://", "ws://")}/api/ws?deviceId=${this.config.deviceId}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.on("open", () => {
      console.log(chalk.green("WebSocket connected"));
      this.reconnectDelay = 1000;
    });

    this.ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(message);
      } catch (error) {
        console.error(chalk.red("Failed to parse message:"), error);
      }
    });

    this.ws.on("close", () => {
      console.log(chalk.yellow("WebSocket disconnected"));
      if (this.running) {
        setTimeout(() => this.connectWs(), this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      }
    });

    this.ws.on("error", (error) => {
      console.error(chalk.red("WebSocket error:"), error.message);
    });
  }

  private async handleMessage(message: {
    type: string;
    requestId: string;
    toolName: string;
    arguments: Record<string, unknown>;
  }): Promise<void> {
    if (message.type !== "request") return;

    const { requestId, toolName, arguments: args } = message;
    console.log(chalk.blue("Executing:"), toolName);

    try {
      const result = await this.executor.execute(toolName, args);
      this.sendResponse(requestId, result.content, result.isError);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.sendResponse(
        requestId,
        [{ type: "text", text: `Error: ${errorMessage}` }],
        true
      );
    }
  }

  private sendResponse(
    requestId: string,
    content: Array<{ type: string; text: string }>,
    isError: boolean
  ): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "response",
          requestId,
          deviceId: this.config.deviceId,
          content,
          isError,
        })
      );
    }

    fetch(`${this.config.apiUrl}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "response",
        requestId,
        deviceId: this.config.deviceId,
        content,
        isError,
      }),
    }).catch(console.error);
  }

  disconnect(): void {
    this.running = false;
    this.ws?.close();
  }
}
