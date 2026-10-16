"use client";

import { useState } from "react";
import Link from "next/link";

export default function ConnectPC() {
  const [copied, setCopied] = useState(false);

  const setupCommand = `curl -fsSL https://pcbridge.russell.app/setup.sh -o setup.sh && bash setup.sh`;

  const handleCopy = () => {
    navigator.clipboard.writeText(setupCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Connect Your Computer</h1>
            <p className="text-[#a3a3a3] mt-1">Set up the PCBridge runner on your machine</p>
          </div>
          <Link href="/" className="btn-secondary text-sm">
            Back to Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
            <p className="text-sm text-[#a3a3a3] mb-4">
              Run this command in your terminal to download and run the setup script:
            </p>
            <div className="code-block relative group">
              <pre>
                <span className="command">$</span> {setupCommand}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 btn-secondary text-xs !py-1 !px-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">What the Setup Script Does</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Detects Your OS</p>
                  <p className="text-xs text-[#a3a3a3]">
                    Supports Linux (including Omarchy), macOS, and Windows (WSL2)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Installs Node.js</p>
                  <p className="text-xs text-[#a3a3a3]">
                    Installs Node.js 20+ if not already present
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Installs PCBridge Runner</p>
                  <p className="text-xs text-[#a3a3a3]">
                    Downloads and configures the local runner agent
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Starts the Agent</p>
                  <p className="text-xs text-[#a3a3a3]">
                    Launches the runner and initiates secure authentication
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Manual Setup</h2>
            <p className="text-sm text-[#a3a3a3] mb-4">
              If you prefer to set up manually, follow these steps:
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white font-medium mb-2">1. Install Node.js</p>
                <p className="text-xs text-[#a3a3a3]">
                  Make sure you have Node.js 20 or later installed. You can check with{" "}
                  <code className="text-indigo-400">node --version</code>
                </p>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-2">2. Download the Runner</p>
                <div className="code-block">
                  <pre>
                    <span className="command">$</span> curl -fsSL https://pcbridge.russell.app/setup.sh -o setup.sh
                  </pre>
                </div>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-2">3. Run the Setup</p>
                <div className="code-block">
                  <pre>
                    <span className="command">$</span> bash setup.sh
                  </pre>
                </div>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-2">4. Start PCBridge</p>
                <p className="text-xs text-[#a3a3a3]">
                  The setup script will display the exact command to start PCBridge. It will look something like:
                </p>
                <div className="code-block mt-2">
                  <pre>
                    <span className="command">$</span> pcbridge start --code XXXXXX
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">MCP Configuration</h2>
            <p className="text-sm text-[#a3a3a3] mb-4">
              Once your runner is connected, add this to your chatbot&apos;s MCP configuration:
            </p>
            <div className="code-block">
              <pre>
{`{
  "mcpServers": {
    "pcbridge": {
      "url": "https://pcbridge.russell.app/api/mcp",
      "headers": {
        "X-Device-Id": "YOUR_DEVICE_ID"
      }
    }
  }
}`}
              </pre>
            </div>
            <p className="text-xs text-[#a3a3a3] mt-3">
              Replace <code className="text-indigo-400">YOUR_DEVICE_ID</code> with the device ID shown in your dashboard.
            </p>
          </div>

          <div className="card gradient-border">
            <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
            <div className="space-y-2 text-sm text-[#a3a3a3]">
              <p>
                <span className="text-green-400 font-medium">All execution stays local.</span>{" "}
                Your code and files never leave your computer.
              </p>
              <p>
                <span className="text-green-400 font-medium">Token-based pairing.</span>{" "}
                You must explicitly authorize each device through the dashboard.
              </p>
              <p>
                <span className="text-green-400 font-medium">Approval required.</span>{" "}
                Destructive operations (rm, git push, etc.) require your explicit approval.
              </p>
              <p>
                <span className="text-green-400 font-medium">Encrypted connection.</span>{" "}
                All communication between your computer and the cloud is encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
