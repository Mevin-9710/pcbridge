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

## State Management and Serverless Constraints

PCBridge's cloud gateway keeps runtime state (paired devices, pending
requests, MCP tool registrations) in module memory, exposed through
`globalThis` singletons so the state is shared across Next.js route bundles.

This "single shared instance" model is correct for:

- Local development (`next dev`)
- Self-hosted Node.js deployments (a single `next start` process)
- Single-region, single-instance hosting

**Vercel serverless limitation:** on Vercel's serverless functions, each
function instance has its own memory. Devices paired in one invocation may
not be visible to another invocation served by a different instance. For
production multi-instance deployment, the three stores
(`lib/device-registry.ts`, `lib/request-queue.ts`, `lib/mcp-server.ts`)
should be backed by a shared store such as Vercel KV / Redis. The interfaces
are intentionally small and pure, so swapping the backing store is a
localized change.

The MCP Streamable HTTP calls (`tools/call`) block until the local runner
returns a result, with a 30-second timeout. This fits Vercel's default
serverless duration limit; longer operations should be split into
asynchronous jobs.

## Tested Behaviors (E2E)

The full loop was verified end-to-end against a running dev server and a
real local runner:

| Step | Result |
|------|--------|
| Health check | 200 healthy |
| Create pairing code | 6-char code, 10-min expiry |
| Pair device | device registered, status online |
| `initialize` | MCP handshake returns serverInfo |
| `tools/list` | 15 tools enumerated |
| `read_file` / `write_file` / `list_files` | execute on the runner host |
| `grep_files` | searches file contents on the runner host |
| `run_command` (safe) | executes directly |
| `run_command` (destructive) | blocked, requires approval |
| Approval flow | request queued → user approves → runner executes |
| `setup.sh` | served as `application/x-sh` |
| `mcp-config` | emits Claude/Cursor/VS Code configs |
| Dashboard / connect-pc / landing | all return 200 |

