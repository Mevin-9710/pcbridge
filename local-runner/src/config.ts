import fs from "fs";
import path from "path";
import os from "os";

export interface RunnerConfig {
  apiUrl: string;
  deviceName: string;
  projectDir: string;
  requireApproval: boolean;
  pairingCode?: string;
  deviceId?: string;
  platform?: string;
  version?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".pcbridge");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export class ConfigManager {
  static load(): RunnerConfig | null {
    try {
      if (!fs.existsSync(CONFIG_FILE)) return null;
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static save(config: RunnerConfig): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  static getDeviceId(): string | null {
    const config = this.load();
    return config?.deviceId || null;
  }

  static setDeviceId(deviceId: string): void {
    const config = this.load();
    if (config) {
      config.deviceId = deviceId;
      this.save(config);
    }
  }

  static getConfigDir(): string {
    return CONFIG_DIR;
  }
}
