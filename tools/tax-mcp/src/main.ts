import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTaxYearTools } from './lib/tools/tax-years';
import { registerIncomeTools } from './lib/tools/income';
import { registerExpenseTools } from './lib/tools/expenses';
import { registerInvestmentTools } from './lib/tools/investments';
import { registerRentalTools } from './lib/tools/rental';
import { registerReceiptTools } from './lib/tools/receipts';
import { registerReportTools } from './lib/tools/reports';

const userIdFlagIdx = process.argv.indexOf('--userId');
const userId = userIdFlagIdx !== -1 ? process.argv[userIdFlagIdx + 1] : undefined;
if (!userId) {
  process.stderr.write('Error: --userId <uid> is required\n');
  process.exit(1);
}

async function main() {
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
