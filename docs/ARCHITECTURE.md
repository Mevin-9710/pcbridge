# PCBridge Architecture

## System Overview

PCBridge consists of three main components:

1. **Cloud Server** (Vercel): Hosts the dashboard, MCP gateway, and request routing
2. **Local Runner** (Your Computer): Executes tool calls and manages skills
3. **MCP Clients** (Chatbots): ChatGPT, Claude, Gemini, etc.

## Communication Flow

```
MCP Client → Cloud MCP Endpoint → Request Queue → Local Runner → Tool Execution → Response
```

1. MCP client sends a tool call to the cloud endpoint
2. Cloud validates the request and queues it
3. Local runner polls (or receives via WebSocket) for pending requests
4. Runner executes the tool locally
5. Runner submits the response back to the cloud
6. Cloud returns the response to the MCP client

## Security Architecture

### Authentication
- Pairing codes (6-character, 10-minute expiry)
- Device IDs (128-bit random hex)
- Token-based session management

### Authorization
- Read operations: No approval required
- Write operations: No approval required (sandboxed)
- Destructive operations: Require explicit approval

### Data Protection
- All execution stays local
- Cloud only routes requests
- HTTPS for all communication

## Technology Stack

| Layer | Technology |
|-------|------------|
| Cloud Framework | Next.js 14 (App Router) |
| MCP SDK | @modelcontextprotocol/sdk |
| Styling | Tailwind CSS + Apple Liquid Glass |
| Local Runtime | Node.js 20+ |
| Communication | WebSocket + HTTP polling |
| Deployment | Vercel |

## Project Structure

```
pcbridge/
├── app/                    # Next.js app
│   ├── api/               # API routes
│   │   ├── mcp/           # MCP endpoint
│   │   ├── devices/       # Device management
│   │   ├── requests/      # Request handling
│   │   ├── ws/            # WebSocket endpoint
│   │   ├── health/        # Health check
│   │   └── mcp-config/    # Config generator
│   ├── dashboard/         # Dashboard page
│   ├── connect-pc/        # Setup instructions
│   └── setup.sh/          # Setup script download
├── lib/                   # Core library
│   ├── mcp-server.ts      # MCP server logic
│   ├── device-registry.ts # Device management
│   ├── request-queue.ts   # Request routing
│   └── tools/             # Tool definitions
├── local-runner/          # Local runner
│   ├── src/               # Runner source
│   │   ├── runner.ts      # Main runner
│   │   ├── executor.ts    # Tool executor
│   │   ├── websocket-client.ts
│   │   └── tools/         # Tool implementations
│   └── skills/            # Reusable skills
├── docs/                  # Documentation
└── setup.sh               # Setup script
```
