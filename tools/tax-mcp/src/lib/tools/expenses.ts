import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { expenseEntriesCol, db } from '@can-tax-pro/db';
import { createExpenseEntrySchema, computeAmountCad } from '@can-tax-pro/utils';
import { ExpenseCategoryType, Currency } from '@can-tax-pro/types';
import { FieldValue } from 'firebase-admin/firestore';

export function registerExpenseTools(server: McpServer, userId: string) {
  server.tool(
    'list_expenses',
    'List business expense entries for a tax year, optionally filtered by category',
    {
      taxYearId: z.string().describe('Firestore tax year document ID'),
      category: z.nativeEnum(ExpenseCategoryType).optional(),
    },
    async ({ taxYearId, category }) => {
      let q = expenseEntriesCol(userId, taxYearId).orderBy('date', 'desc') as FirebaseFirestore.Query;
      if (category) q = q.where('category', '==', category);
      const snap = await q.get();
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] };
    }
  );

  server.tool(
    'create_expense',
    'Create a single business expense entry for a tax year',
    {
      taxYearId: z.string(),
      category: z.nativeEnum(ExpenseCategoryType),
      vendor: z.string().optional(),
      description: z.string().optional(),
      amount: z.number().positive(),
      currency: z.nativeEnum(Currency).optional(),
      exchangeRate: z.number().positive().optional(),
      date: z.string().date().describe('ISO date string YYYY-MM-DD'),
      paymentMethod: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    },
    async ({ taxYearId, ...data }) => {
      const parsed = createExpenseEntrySchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const currency = parsed.data.currency ?? Currency.CAD;
      const amountCad = computeAmountCad(parsed.data.amount, currency, parsed.data.exchangeRate);
      const ref = await expenseEntriesCol(userId, taxYearId).add({
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
    'bulk_import_expenses',
    'Batch-import multiple business expense entries at once for a tax year',
    {
      taxYearId: z.string(),
      entries: z.array(createExpenseEntrySchema).min(1),
    },
    async ({ taxYearId, entries }) => {
      const batch = db.batch();
      const col = expenseEntriesCol(userId, taxYearId);
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
