# PCBridge Setup Guide

## Prerequisites

- Node.js 20 or later
- A modern web browser
- An MCP-compatible chatbot (ChatGPT, Claude, Gemini, etc.)

## Quick Start

### 1. Download and Run the Setup Script

```bash
curl -fsSL https://pcbridge.vercel.app/setup.sh -o setup.sh && bash setup.sh
```

The script will:
1. Detect your operating system
2. Install Node.js if needed
3. Download and install the PCBridge runner
4. Create a launcher command

### 2. Get a Pairing Code

1. Go to [pcbridge.vercel.app/dashboard](https://pcbridge.vercel.app/dashboard)
2. Enter a device name (e.g., "My Laptop")
3. Click "Generate Code"
4. Copy the 6-character code

### 3. Start PCBridge

```bash
pcbridge start --code XXXXXX
```

Replace `XXXXXX` with your pairing code.

### 4. Configure Your Chatbot

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "pcbridge": {
      "url": "https://pcbridge.vercel.app/api/mcp",
      "headers": {
        "X-Device-Id": "YOUR_DEVICE_ID"
      }
    }
  }
}
```

#### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "pcbridge": {
      "url": "https://pcbridge.vercel.app/api/mcp",
      "headers": {
        "X-Device-Id": "YOUR_DEVICE_ID"
      }
    }
  }
}
```

#### VS Code

Add to your VS Code settings:

```json
{
  "mcp.servers": {
    "pcbridge": {
      "type": "http",
      "url": "https://pcbridge.vercel.app/api/mcp",
      "headers": {
        "X-Device-Id": "YOUR_DEVICE_ID"
      }
    }
  }
}
```

## Finding Your Device ID

Run the following command:

```bash
pcbridge status
```

Or check the dashboard at [pcbridge.vercel.app/dashboard](https://pcbridge.vercel.app/dashboard).

## Troubleshooting

### Pairing fails
- Make sure the code is correct and not expired (codes expire after 10 minutes)
- Check your internet connection
- Try generating a new code

### Device shows as offline
- Make sure the runner is running (`pcbridge start`)
- Check your internet connection
- Try restarting the runner

### Chatbot can't connect
- Verify the MCP configuration is correct
- Make sure the device ID is correct
- Check that the runner is running and online

## Uninstall

```bash
rm -rf ~/.pcbridge
rm -f ~/.local/bin/pcbridge
```

## Getting Help

- [GitHub Issues](https://github.com/Mevin-9710/pcbridge/issues)
- [Security Policy](./SECURITY.md)
