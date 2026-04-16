# Design: Publish `@cantax-fyi/tax-mcp` to npm

## Overview

Convert `libs/tax-mcp` from a standalone Firebase-coupled MCP server into a thin stdio→HTTP proxy npm package. All business logic stays in the Python Cloud Run server. The npm package is a zero-dependency bridge that users install via `npx`.

## Architecture

```
Claude Code (stdio)
    ↓
npx @cantax-fyi/tax-mcp --apiKey <key>
    ↓  StreamableHTTPClientTransport + X-API-Key header
https://tax-mcp-371544889573.us-central1.run.app/mcp
    ↓
Python Cloud Run (Firebase, all 18 tools)
```

## Components

### `libs/tax-mcp/src/main.ts` (rewrite)

~25 lines. Responsibilities:
1. Parse `--apiKey <value>` from `process.argv`
2. Exit with error message if missing
3. Connect `StreamableHTTPClientTransport` to Cloud Run `/mcp` with `X-API-Key` header
4. Bridge to `StdioServerTransport`

No tool registration, no Firebase, no workspace lib imports.

### `libs/tax-mcp/package.json` (rewrite)

- `name`: `@cantax-fyi/tax-mcp`
- Remove `"private": true`
- `version`: `0.0.1`
- `main`: `dist/main.js`
- `bin`: `{ "cantax-fyi-mcp": "dist/main.js" }`
- `files`: `["dist"]`
- `dependencies`: `{ "@modelcontextprotocol/sdk": "^1.26.0" }`
- Remove `@can-tax-pro/db` dependency entirely

### `libs/tax-mcp/src/lib/tools/*` (delete)

All 7 tool files deleted — server owns all tools.

### Build: `@nx/esbuild` executor

Added to `libs/tax-mcp/project.json`:
- Entry: `libs/tax-mcp/src/main.ts`
- Output: `libs/tax-mcp/dist/`
- Format: CJS
- Bundle: true (inline all, including MCP SDK)
- External: none (MCP SDK is small, no native bindings)

### Publish: `nx release`

```bash
pnpm nx release --projects=tax-mcp-sdk
```

Handles versioning, changelog, and `npm publish --access public`.

## Workspace Rename: `@can-tax-pro/*` → `@cantax-fyi/*`

| Location | Old | New |
|----------|-----|-----|
| `libs/tax-mcp/package.json` | `@can-tax-pro/tax-mcp` | `@cantax-fyi/tax-mcp` |
| `libs/db/package.json` | `@can-tax-pro/db` | `@cantax-fyi/db` |
| `tsconfig.base.json` paths | `@can-tax-pro/*` | `@cantax-fyi/*` |
| All source imports | `@can-tax-pro/*` | `@cantax-fyi/*` |
| `project.json` metadata | `@can-tax-pro/tax-mcp` | `@cantax-fyi/tax-mcp` |

## User Experience After Publishing

```json
{
  "mcpServers": {
    "can-tax-pro": {
      "command": "npx",
      "args": ["@cantax-fyi/tax-mcp", "--apiKey", "<key-from-settings>"]
    }
  }
}
```

## Error Handling

- Missing `--apiKey`: print to stderr, exit 1
- HTTP 401 from server: pipe error to stderr, exit 1
- Connection failure: let MCP SDK surface naturally
