import { createHash } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { apiKeyDoc } from '@cantax-fyi/db';
import { registerTaxYearTools } from './lib/tools/tax-years';
import { registerIncomeTools } from './lib/tools/income';
import { registerExpenseTools } from './lib/tools/expenses';
import { registerInvestmentTools } from './lib/tools/investments';
import { registerRentalTools } from './lib/tools/rental';
import { registerReceiptTools } from './lib/tools/receipts';
import { registerReportTools } from './lib/tools/reports';

async function resolveUserId(): Promise<string> {
  const apiKeyFlagIdx = process.argv.indexOf('--apiKey');
  const apiKey = apiKeyFlagIdx !== -1 ? process.argv[apiKeyFlagIdx + 1] : undefined;
  if (!apiKey) {
    process.stderr.write('Error: --apiKey <key> is required\nGenerate one in Settings → MCP API Keys\n');
    process.exit(1);
  }

  const hash = createHash('sha256').update(apiKey).digest('hex');
  const doc = await apiKeyDoc(hash).get();
  if (!doc.exists) {
    process.stderr.write('Error: invalid or revoked API key\n');
    process.exit(1);
  }

  // Update lastUsedAt in background — don't await
  apiKeyDoc(hash).update({ lastUsedAt: new Date() }).catch(() => undefined);

  return doc.data()!['userId'] as string;
}

async function main() {
  const userId = await resolveUserId();

  const server = new McpServer({ name: 'can-tax-pro', version: '1.0.0' });

  registerTaxYearTools(server, userId);
  registerIncomeTools(server, userId);
  registerExpenseTools(server, userId);
  registerInvestmentTools(server, userId);
  registerRentalTools(server, userId);
  registerReceiptTools(server, userId);
  registerReportTools(server, userId);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
