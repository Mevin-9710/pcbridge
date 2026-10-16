# PCBridge

**Use your computer like a coding agent — from any AI chatbot.**

PCBridge is a web-hosted MCP bridge that lets ChatGPT, Claude, Gemini, and other compatible chatbots execute code, edit files, run commands, and use Git on your computer through a secure connection.

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Chatbot    │────▶│  PCBridge Cloud  │────▶│  Your Computer  │
│ (ChatGPT, etc.) │◀────│  (Vercel + MCP)  │◀────│  (Local Runner) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

1. **Cloud** (`pcbridge.vercel.app`): Hosts the dashboard, MCP gateway, and request routing
2. **Local Runner**: Lightweight agent on your computer that executes tool calls
3. **Secure Connection**: Token-based pairing with configurable approval for destructive operations

## Quick Start

### 1. Install the Runner

```bash
curl -fsSL https://pcbridge.vercel.app/setup.sh -o setup.sh && bash setup.sh
```

### 2. Get a Pairing Code

Go to [pcbridge.vercel.app/dashboard](https://pcbridge.vercel.app/dashboard) and click "Generate Code".

### 3. Start PCBridge

```bash
pcbridge start --code XXXXXX
```

### 4. Configure Your Chatbot

Add to your chatbot's MCP configuration:

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

## Features

- **File Operations**: Read, write, edit, list, and delete files
- **Terminal**: Execute commands with configurable approval for destructive operations
- **Git**: Status, diff, log, and commit (with approval)
- **Secure**: Token-based pairing, path sandboxing, approval system
- **MCP Native**: Works with any MCP-compatible chatbot
- **Cross-Platform**: Linux (including Omarchy), macOS, Windows (WSL2)

## Architecture

| Component | Location | Description |
|-----------|----------|-------------|
| Cloud | `app/` | Next.js app with MCP endpoint, dashboard, and device registry |
| Local Runner | `local-runner/` | Node.js agent that executes tool calls |
| Setup | `setup.sh` | OS detection, Node.js installation, runner setup |

## Security

- All execution stays on your computer
- Token-based device pairing
- Path sandboxing (operations restricted to project directory)
- Configurable approval for destructive operations
- Encrypted cloud communication

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

## Deployment

The cloud gateway keeps runtime state (paired devices, pending approvals) in a
store. On serverless hosts each request can hit a different instance, so state
must be shared:

1. Deploy to Vercel.
2. Add an **Upstash Redis** database (Vercel → Storage → Upstash, or the
   Marketplace integration). This injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` automatically.
3. Redeploy. `/api/health` reports `"storage": "shared"`.

Without a shared store, the app falls back to in-memory state — fine for local
development and single-instance hosting, but on Vercel the dashboard may not
show a connected runner. The dashboard warns when in-memory mode is active.

## Documentation

- [Setup Guide](https://pcbridge.vercel.app/connect-pc)
- [Security Model](./docs/SECURITY.md)
- [GitHub](https://github.com/Mevin-9710/pcbridge)

## License

MIT
