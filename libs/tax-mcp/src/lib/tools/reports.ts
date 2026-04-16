import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  incomeEntriesCol,
  expenseEntriesCol,
  rentalPropertiesCol,
  rentalIncomesCol,
  rentalExpensesCol,
  investmentsCol,
  taxYearsCol,
} from '@cantax-fyi/db';
import { estimateFederalTax } from '@cantax-fyi/utils';
import { IncomeSourceType, InvestmentAccountType } from '@cantax-fyi/types';

export function registerReportTools(server: McpServer, userId: string) {
  server.tool(
    'get_tax_summary',
    'Compute full tax summary for a tax year: income, expenses, rental, investments, and estimated federal tax',
    { taxYearId: z.string() },
    async ({ taxYearId }) => {
      const taxYearDoc = await taxYearsCol(userId).doc(taxYearId).get();
      if (!taxYearDoc.exists) throw new Error('Tax year not found');
      const taxYearData = taxYearDoc.data();

      const [incomeSnap, expenseSnap, propsSnap, investSnap] = await Promise.all([
        incomeEntriesCol(userId, taxYearId).get(),
        expenseEntriesCol(userId, taxYearId).get(),
        rentalPropertiesCol(userId, taxYearId).get(),
        investmentsCol(userId, taxYearId).get(),
      ]);

      let totalBusinessIncome = 0;
      for (const doc of incomeSnap.docs) {
        const d = doc.data();
        if (
          d['sourceType'] === IncomeSourceType.INTERNET_BUSINESS ||
          d['sourceType'] === IncomeSourceType.STRIPE
        ) {
          totalBusinessIncome += d['amountCad'] ?? d['amount'] ?? 0;
        }
      }

      let totalBusinessExpenses = 0;
      for (const doc of expenseSnap.docs) {
        const d = doc.data();
        totalBusinessExpenses += d['amountCad'] ?? d['amount'] ?? 0;
      }

      let totalRentalIncome = 0;
      let totalRentalExpenses = 0;
      for (const prop of propsSnap.docs) {
        const [rIncSnap, rExpSnap] = await Promise.all([
          rentalIncomesCol(userId, taxYearId, prop.id).get(),
          rentalExpensesCol(userId, taxYearId, prop.id).get(),
        ]);
        for (const d of rIncSnap.docs) totalRentalIncome += d.data()['amount'] ?? 0;
        for (const d of rExpSnap.docs) totalRentalExpenses += d.data()['amount'] ?? 0;
      }

      let rrspContributions = 0;
      let tfsaContributions = 0;
      for (const doc of investSnap.docs) {
        const d = doc.data();
        const amt = d['amountCad'] ?? d['amount'] ?? 0;
        if (d['accountType'] === InvestmentAccountType.RRSP) rrspContributions += amt;
        else if (d['accountType'] === InvestmentAccountType.TFSA) tfsaContributions += amt;
      }

      const totalIncome = totalBusinessIncome + totalRentalIncome;
      const totalDeductions = totalBusinessExpenses + rrspContributions;
      const taxableIncome = totalIncome - totalDeductions;

      const summary = {
        taxYear: taxYearData?.['year'] ?? 0,
        totalBusinessIncome,
        totalBusinessExpenses,
        netBusinessIncome: totalBusinessIncome - totalBusinessExpenses,
        totalRentalIncome,
        totalRentalExpenses,
        netRentalIncome: totalRentalIncome - totalRentalExpenses,
        rrspContributions,
        tfsaContributions,
        totalIncome,
        totalDeductions,
        estimatedTax: estimateFederalTax(taxableIncome),
      };
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }
  );
}
