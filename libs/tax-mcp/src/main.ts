#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

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
  const stdio = new StdioServerTransport();

  stdio.onmessage = async (msg) => {
    const isNotification = !('id' in msg);
    try {
      const res = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(msg),
      });

      if (!res.ok) {
        process.stderr.write(`HTTP ${res.status}: ${await res.text()}\n`);
        return;
      }

      // JSON-RPC notifications have no id — responses are not allowed
      if (isNotification) return;

      const contentType = res.headers.get('content-type') ?? '';

      if (contentType.includes('text/event-stream')) {
        // SSE: read lines and forward each data event
        const text = await res.text();
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              await stdio.send(payload);
            } catch {
              // skip non-JSON data lines
            }
          }
        }
      } else {
        const payload = await res.json();
        await stdio.send(payload);
      }
    } catch (err) {
      process.stderr.write(`Proxy error: ${err}\n`);
    }
  };

  stdio.onerror = (err) => {
    process.stderr.write(`stdio error: ${err.message}\n`);
    process.exit(1);
  };

  await stdio.start();
}

main().catch((err) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
