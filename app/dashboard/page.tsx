"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Device {
  id: string;
  name: string;
  status: "online" | "offline" | "pending";
  pairedAt: string;
  lastSeen: string;
  platform: string;
  version: string;
}

interface PendingApproval {
  id: string;
  deviceId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  timestamp: string;
}

interface McpConfigs {
  claudeDesktop: unknown;
  cursor: unknown;
  vscode: unknown;
}

type ClientKey = "claudeDesktop" | "cursor" | "vscode";

const CLIENT_LABELS: Record<ClientKey, string> = {
  claudeDesktop: "Claude Desktop",
  cursor: "Cursor",
  vscode: "VS Code",
};

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<McpConfigs | null>(null);
  const [client, setClient] = useState<ClientKey>("claudeDesktop");
  const [copied, setCopied] = useState(false);
  const [storage, setStorage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [devicesRes, approvalsRes, healthRes] = await Promise.all([
        fetch("/api/devices"),
        fetch("/api/requests"),
        fetch("/api/health"),
      ]);
      const devicesData = await devicesRes.json();
      const approvalsData = await approvalsRes.json();
      const healthData = await healthRes.json();
      setDevices(devicesData.devices || []);
      setPendingApprovals(approvalsData.pendingApprovals || []);
      setStorage(healthData.storage || null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (devices.length === 0) {
      setSelectedDeviceId(null);
      setConfigs(null);
      return;
    }
    setSelectedDeviceId((current) => {
      if (current && devices.some((d) => d.id === current)) return current;
      return devices[0].id;
    });
  }, [devices]);

  useEffect(() => {
    if (!selectedDeviceId) return;
    let active = true;
    fetch(`/api/mcp-config?deviceId=${selectedDeviceId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.configs) setConfigs(data.configs);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selectedDeviceId]);

  const handleCopyConfig = (value: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreatePairing = async () => {
    if (!deviceName.trim()) return;
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName }),
      });
      const data = await res.json();
      if (data.pairingCode) {
        setPairingCode(data.pairingCode);
      }
    } catch (err) {
      console.error("Failed to create pairing:", err);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", requestId }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deny", requestId }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to deny:", err);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    try {
      await fetch(`/api/devices/${deviceId}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-[#a3a3a3] mt-1">Manage your connected devices and approvals</p>
          </div>
          <Link href="/" className="btn-secondary text-sm">
            Back to Home
          </Link>
        </div>

        {storage === "in-memory" && (
          <div className="card mb-8 border border-yellow-500/30 bg-yellow-500/10">
            <p className="text-sm text-yellow-200 font-medium">
              Devices may not appear here reliably.
            </p>
            <p className="text-xs text-yellow-200/80 mt-1">
              This deployment is using in-memory storage. On serverless hosts (like Vercel)
              each request can hit a different instance with its own memory, so your runner
              may show as connected locally but not appear above. Connect a Redis/KV store
              (set <code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code>) to share
              state across instances.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Connect a Device</h2>
            {pairingCode ? (
              <div className="text-center">
                <p className="text-sm text-[#a3a3a3] mb-3">Enter this code in your PCBridge runner:</p>
                <div className="glass-strong rounded-xl p-4 mb-4">
                  <span className="text-3xl font-mono font-bold tracking-widest gradient-text">
                    {pairingCode}
                  </span>
                </div>
                <p className="text-xs text-[#a3a3a3]">Code expires in 10 minutes</p>
                <div className="code-block mt-4 text-left">
                  <pre>
                    <span className="command">$</span> pcbridge start --code {pairingCode}
                  </pre>
                </div>
                <p className="text-xs text-[#a3a3a3] mt-2">
                  Not installed yet?{" "}
                  <Link href="/connect-pc" className="text-indigo-400 hover:text-indigo-300">
                    Run the setup script
                  </Link>{" "}
                  first.
                </p>
                <button
                  onClick={() => setPairingCode(null)}
                  className="btn-secondary text-sm mt-4"
                >
                  Generate New Code
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Device name (e.g., My Laptop)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a3a3a3] focus:outline-none focus:border-indigo-500 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePairing()}
                />
                <button onClick={handleCreatePairing} className="btn-primary">
                  Generate Code
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Pending Approvals</h2>
            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-[#a3a3a3]">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="glass-subtle rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{approval.toolName}</span>
                      <span className="text-xs text-[#a3a3a3]">
                        {new Date(approval.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#a3a3a3] mb-3 font-mono">
                      {JSON.stringify(approval.arguments).slice(0, 80)}...
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-500/30 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(approval.id)}
                        className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-500/30 transition-colors"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Connected Devices</h2>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#a3a3a3]">No devices connected yet.</p>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Generate a pairing code above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="glass-subtle rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className={`status-dot status-${device.status}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{device.name}</p>
                      <p className="text-xs text-[#a3a3a3]">
                        {device.platform} • v{device.version} • Last seen{" "}
                        {new Date(device.lastSeen).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(device.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Connect to your Chatbot</h2>
          {devices.length === 0 ? (
            <p className="text-sm text-[#a3a3a3]">
              Pair a device above first, then add PCBridge to your chatbot as an MCP server.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#a3a3a3]">
                Add PCBridge as an MCP server in your chatbot. Pick your client, copy the
                config, and restart it.
              </p>

              {devices.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {devices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDeviceId(device.id)}
                      className={
                        selectedDeviceId === device.id
                          ? "btn-primary text-xs !py-2 !px-4"
                          : "btn-secondary text-xs !py-2 !px-4"
                      }
                    >
                      {device.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(Object.keys(CLIENT_LABELS) as ClientKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setClient(key)}
                    className={
                      client === key
                        ? "bg-indigo-500/30 text-white border border-indigo-400/40 rounded-lg px-3 py-1.5 text-xs font-medium"
                        : "bg-white/5 text-[#a3a3a3] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium hover:text-white transition-colors"
                    }
                  >
                    {CLIENT_LABELS[key]}
                  </button>
                ))}
              </div>

              <div className="code-block relative group">
                <pre className="overflow-x-auto">
                  {configs
                    ? JSON.stringify(configs[client], null, 2)
                    : "Loading configuration..."}
                </pre>
                <button
                  onClick={() => configs && handleCopyConfig(configs[client])}
                  className="absolute top-2 right-2 btn-secondary text-xs !py-1 !px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="text-xs text-[#a3a3a3] space-y-1">
                <p>
                  MCP server URL:{" "}
                  <code className="text-indigo-400">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/api/mcp`
                      : "https://pcbridge.vercel.app/api/mcp"}
                  </code>
                </p>
                <p>
                  Header: <code className="text-indigo-400">X-Device-Id: {selectedDeviceId}</code>
                </p>
                <p>
                  For ChatGPT or other clients, use the URL and header above (streamable HTTP
                  transport).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
