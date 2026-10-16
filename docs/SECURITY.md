# PCBridge Security Model

## Overview

PCBridge is designed with security as a core principle. All code execution happens on your computer — the cloud only routes requests and stores minimal metadata.

## Authentication & Pairing

1. **Pairing Code**: A 6-character code is generated on the dashboard
2. **Device Registration**: The runner uses the code to register with the cloud
3. **Device ID**: A unique 32-character hex ID is issued upon successful pairing
4. **Session Persistence**: The device ID is stored locally in `~/.pcbridge/config.json`

## Authorization

- **Read Operations** (read_file, list_files, git_status, git_diff, git_log): No approval required
- **Write Operations** (write_file, edit_file): No approval required (sandboxed to project directory)
- **Destructive Operations** (run_command with destructive patterns, git_commit, delete_file): Require explicit approval through the dashboard

## Path Sandboxing

All file operations are restricted to the configured project directory. Attempts to access files outside this directory are rejected.

## Command Safety

Destructive command patterns are detected and require approval:
- `rm -rf`, `rm -fr`
- `mkfs`, `dd` to device files
- `chmod -R 777`, `chown -R`
- `sudo rm`
- `git push --force`, `git reset --hard`, `git clean -fd`
- `npm publish`
- `docker system prune`

## Data Protection

- **No code leaves your computer**: Only tool results (file contents, command output) are transmitted
- **Encrypted transport**: All cloud communication uses HTTPS
- **Minimal cloud storage**: The cloud only stores device metadata and pending request state
- **No credentials in the cloud**: API keys and tokens never leave your machine

## Network Security

- The local runner only makes outbound HTTPS connections to the cloud API
- No inbound ports need to be opened
- WebSocket connections are authenticated with device IDs

## Threat Model

| Threat | Mitigation |
|--------|------------|
| Unauthorized device pairing | Time-limited pairing codes (10 min) |
| Path traversal | Path sandboxing to project directory |
| Destructive commands | Pattern detection + approval system |
| Man-in-the-middle | HTTPS for all cloud communication |
| Token theft | Device IDs are random 128-bit values |
| Cloud compromise | No code or credentials stored in cloud |

## Reporting

If you find a security issue, please report it privately to the maintainers before disclosing publicly.
