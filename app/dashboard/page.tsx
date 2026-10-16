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

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [devicesRes, approvalsRes] = await Promise.all([
        fetch("/api/devices"),
        fetch("/api/requests"),
      ]);
      const devicesData = await devicesRes.json();
      const approvalsData = await approvalsRes.json();
      setDevices(devicesData.devices || []);
      setPendingApprovals(approvalsData.pendingApprovals || []);
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
      </div>
    </main>
  );
}
