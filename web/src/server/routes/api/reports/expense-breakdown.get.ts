import { defineEventHandler, getQuery, createError } from 'h3';
import { expenseEntriesCol } from '@can-tax-pro/db';
import { ExpenseCategoryType } from '@can-tax-pro/types';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const snap = await expenseEntriesCol(userId, taxYearId).orderBy('date', 'desc').get();
  const entries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const groupMap = new Map<string, { entries: unknown[]; total: number }>();
  for (const cat of Object.values(ExpenseCategoryType)) {
    groupMap.set(cat, { entries: [], total: 0 });
  }

  for (const entry of entries) {
    const cat = (entry as Record<string, unknown>)['category'] as string;
    if (!groupMap.has(cat)) groupMap.set(cat, { entries: [], total: 0 });
    const group = groupMap.get(cat)!;
    group.entries.push(entry);
    group.total += ((entry as Record<string, unknown>)['amountCad'] as number) ?? ((entry as Record<string, unknown>)['amount'] as number) ?? 0;
  }

  const groups = Array.from(groupMap.entries())
    .map(([category, g]) => ({ category, entries: g.entries, total: g.total }))
    .filter((g) => g.entries.length > 0);

  const grandTotal = groups.reduce((sum, g) => sum + g.total, 0);

  return { groups, grandTotal };
});
