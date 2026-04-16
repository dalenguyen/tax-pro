import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { taxYearsCol } from '@cantax-fyi/db';
import { createTaxYearSchema } from '@cantax-fyi/utils';
import { FieldValue } from 'firebase-admin/firestore';

export function registerTaxYearTools(server: McpServer, userId: string) {
  server.tool(
    'list_tax_years',
    'List all tax years for the configured user, ordered by year descending',
    {},
    async () => {
      const snap = await taxYearsCol(userId).orderBy('year', 'desc').get();
      const years = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(years, null, 2) }] };
    }
  );

  server.tool(
    'create_tax_year',
    'Create a new tax year (2000–2100). Returns 409 if year already exists.',
    { year: z.number().int().min(2000).max(2100), notes: z.string().optional() },
    async ({ year, notes }) => {
      const parsed = createTaxYearSchema.safeParse({ year, notes });
      if (!parsed.success) throw new Error(parsed.error.message);

      const existing = await taxYearsCol(userId).where('year', '==', year).limit(1).get();
      if (!existing.empty) throw new Error(`Tax year ${year} already exists`);

      const ref = await taxYearsCol(userId).add({
        year,
        notes: notes ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const doc = await ref.get();
      return { content: [{ type: 'text', text: JSON.stringify({ id: doc.id, ...doc.data() }) }] };
    }
  );
}
