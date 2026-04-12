import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const from = (query['from'] as string) || 'USD';
  const to = (query['to'] as string) || 'CAD';

  // Hardcoded average annual rate - Bank of Canada 2025 USD/CAD ~1.36
  // TODO: integrate Bank of Canada API
  return { from, to, rate: 1.36, source: 'average-annual-2025' };
});
