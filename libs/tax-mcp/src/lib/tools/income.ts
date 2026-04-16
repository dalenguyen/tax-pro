import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { incomeEntriesCol, db } from '@cantax-fyi/db';
import { createIncomeEntrySchema, computeAmountCad } from '@cantax-fyi/utils';
import { IncomeSourceType, Currency } from '@cantax-fyi/types';
import { FieldValue } from 'firebase-admin/firestore';

export function registerIncomeTools(server: McpServer, userId: string) {
  server.tool(
    'list_income',
    'List income entries for a tax year, optionally filtered by sourceType',
    {
      taxYearId: z.string().describe('Firestore tax year document ID'),
      sourceType: z.nativeEnum(IncomeSourceType).optional(),
    },
    async ({ taxYearId, sourceType }) => {
      let q = incomeEntriesCol(userId, taxYearId).orderBy('date', 'desc') as FirebaseFirestore.Query;
      if (sourceType) q = q.where('sourceType', '==', sourceType);
      const snap = await q.get();
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] };
    }
  );

  server.tool(
    'create_income',
    'Create a single income entry for a tax year',
    {
      taxYearId: z.string(),
      sourceType: z.nativeEnum(IncomeSourceType),
      description: z.string().optional(),
      amount: z.number().positive(),
      currency: z.nativeEnum(Currency).optional(),
      exchangeRate: z.number().positive().optional(),
      date: z.string().date().describe('ISO date string YYYY-MM-DD'),
      category: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    },
    async ({ taxYearId, ...data }) => {
      const parsed = createIncomeEntrySchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const currency = parsed.data.currency ?? Currency.CAD;
      const amountCad = computeAmountCad(parsed.data.amount, currency, parsed.data.exchangeRate);
      const ref = await incomeEntriesCol(userId, taxYearId).add({
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

  server.tool(
    'bulk_import_income',
    'Batch-import multiple income entries at once for a tax year',
    {
      taxYearId: z.string(),
      entries: z.array(createIncomeEntrySchema).min(1),
    },
    async ({ taxYearId, entries }) => {
      const batch = db.batch();
      const col = incomeEntriesCol(userId, taxYearId);
      for (const entry of entries) {
        const currency = entry.currency ?? Currency.CAD;
        const amountCad = computeAmountCad(entry.amount, currency, entry.exchangeRate);
        batch.set(col.doc(), {
          ...entry,
          currency,
          amountCad,
          date: new Date(entry.date),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      return { content: [{ type: 'text', text: JSON.stringify({ imported: entries.length }) }] };
    }
  );
}
