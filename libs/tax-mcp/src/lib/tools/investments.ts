import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { investmentsCol } from '@cantax-fyi/db';
import { createInvestmentSchema, computeAmountCad } from '@cantax-fyi/utils';
import { InvestmentAccountType, Currency } from '@cantax-fyi/types';
import { FieldValue } from 'firebase-admin/firestore';

export function registerInvestmentTools(server: McpServer, userId: string) {
  server.tool(
    'list_investments',
    'List RRSP/TFSA contributions for a tax year, optionally filtered by account type',
    {
      taxYearId: z.string(),
      accountType: z.nativeEnum(InvestmentAccountType).optional(),
    },
    async ({ taxYearId, accountType }) => {
      let q = investmentsCol(userId, taxYearId).orderBy('date', 'desc') as FirebaseFirestore.Query;
      if (accountType) q = q.where('accountType', '==', accountType);
      const snap = await q.get();
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] };
    }
  );

  server.tool(
    'create_investment',
    'Record a new RRSP or TFSA contribution for a tax year',
    {
      taxYearId: z.string(),
      accountType: z.nativeEnum(InvestmentAccountType),
      amount: z.number().positive(),
      currency: z.nativeEnum(Currency).optional(),
      exchangeRate: z.number().positive().optional(),
      institution: z.string().optional(),
      date: z.string().date().describe('ISO date string YYYY-MM-DD'),
      roomRemaining: z.number().optional(),
      notes: z.string().optional(),
    },
    async ({ taxYearId, ...data }) => {
      const parsed = createInvestmentSchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const currency = parsed.data.currency ?? Currency.CAD;
      const amountCad = computeAmountCad(parsed.data.amount, currency, parsed.data.exchangeRate);
      const ref = await investmentsCol(userId, taxYearId).add({
        ...parsed.data,
        currency,
        amountCad,
        date: new Date(parsed.data.date),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const doc = await ref.get();
      return { content: [{ type: 'text', text: JSON.stringify({ id: doc.id, ...doc.data() }) }] };
    }
  );
}
