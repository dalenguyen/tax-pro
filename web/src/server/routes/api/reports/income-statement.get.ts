import { defineEventHandler, getQuery, createError } from 'h3';
import { incomeEntriesCol } from '@cantax-fyi/db';
import { IncomeSourceType } from '@cantax-fyi/types';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const snap = await incomeEntriesCol(userId, taxYearId).orderBy('date', 'desc').get();
  const entries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const groupMap = new Map<string, { entries: unknown[]; total: number }>();
  for (const sourceType of Object.values(IncomeSourceType)) {
    groupMap.set(sourceType, { entries: [], total: 0 });
  }

  for (const entry of entries) {
    const st = (entry as Record<string, unknown>)['sourceType'] as string;
    if (!groupMap.has(st)) groupMap.set(st, { entries: [], total: 0 });
    const group = groupMap.get(st)!;
    group.entries.push(entry);
    group.total += ((entry as Record<string, unknown>)['amountCad'] as number) ?? ((entry as Record<string, unknown>)['amount'] as number) ?? 0;
  }

  const groups = Array.from(groupMap.entries())
    .map(([sourceType, g]) => ({ sourceType, entries: g.entries, total: g.total }))
    .filter((g) => g.entries.length > 0);

  const grandTotal = groups.reduce((sum, g) => sum + g.total, 0);

  return { groups, grandTotal };
});
