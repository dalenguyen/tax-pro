#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const SERVER_URL = 'https://tax-mcp-371544889573.us-central1.run.app/mcp';

function getApiKey(): string {
  const idx = process.argv.indexOf('--apiKey');
  const key = idx !== -1 ? process.argv[idx + 1] : process.env['CANTAX_API_KEY'];
  if (!key) {
    process.stderr.write(
      'Error: --apiKey <key> or CANTAX_API_KEY env var is required\nGenerate one at cantax.fyi → Settings → MCP API Keys\n'
    );
    process.exit(1);
  }
  return key;
}

async function main() {
  const apiKey = getApiKey();

  // Raw transport proxy — no Client/Server handshake here.
  // Claude Code sends MCP JSON-RPC on stdin; we forward to HTTP and pipe responses back.
  const http = new StreamableHTTPClientTransport(new URL(SERVER_URL), {
    requestInit: { headers: { 'X-API-Key': apiKey } },
  });

  const stdio = new StdioServerTransport();

  // Wire: stdio → HTTP
  stdio.onmessage = (msg) => http.send(msg);
  // Wire: HTTP → stdio
  http.onmessage = (msg) => stdio.send(msg);

  http.onerror = (err) => {
    process.stderr.write(`MCP error: ${err.message}\n`);
    process.exit(1);
  };

  stdio.onerror = (err) => {
    process.stderr.write(`stdio error: ${err.message}\n`);
    process.exit(1);
  };

  await http.start();
  await stdio.start();
}

main().catch((err) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
