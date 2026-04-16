import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { rentalPropertiesCol, rentalIncomesCol, rentalExpensesCol } from '@cantax-fyi/db';
import {
  createRentalPropertySchema,
  createRentalIncomeSchema,
  createRentalExpenseSchema,
} from '@cantax-fyi/utils';
import { RentalExpenseCategory } from '@cantax-fyi/types';
import { FieldValue } from 'firebase-admin/firestore';

export function registerRentalTools(server: McpServer, userId: string) {
  server.tool(
    'list_rental_properties',
    'List all rental properties for a tax year',
    { taxYearId: z.string() },
    async ({ taxYearId }) => {
      const snap = await rentalPropertiesCol(userId, taxYearId).get();
      const props = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(props, null, 2) }] };
    }
  );

  server.tool(
    'create_rental_property',
    'Add a new rental property for a tax year',
    { taxYearId: z.string(), address: z.string() },
    async ({ taxYearId, address }) => {
      const parsed = createRentalPropertySchema.safeParse({ address });
      if (!parsed.success) throw new Error(parsed.error.message);
      const ref = await rentalPropertiesCol(userId, taxYearId).add({
        address,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const doc = await ref.get();
      return { content: [{ type: 'text', text: JSON.stringify({ id: doc.id, ...doc.data() }) }] };
    }
  );

  server.tool(
    'list_rental_income',
    'List all rental income entries for a specific property',
    { taxYearId: z.string(), propertyId: z.string() },
    async ({ taxYearId, propertyId }) => {
      const snap = await rentalIncomesCol(userId, taxYearId, propertyId).orderBy('date', 'desc').get();
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] };
    }
  );

  server.tool(
    'add_rental_income',
    'Record rental income for a specific property',
    {
      taxYearId: z.string(),
      propertyId: z.string(),
      amount: z.number().positive(),
      date: z.string().date().describe('ISO date string YYYY-MM-DD'),
      description: z.string().optional(),
    },
    async ({ taxYearId, propertyId, ...data }) => {
      const parsed = createRentalIncomeSchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const ref = await rentalIncomesCol(userId, taxYearId, propertyId).add({
        ...parsed.data,
        date: new Date(parsed.data.date),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const doc = await ref.get();
      return { content: [{ type: 'text', text: JSON.stringify({ id: doc.id, ...doc.data() }) }] };
    }
  );

  server.tool(
    'list_rental_expenses',
    'List rental expenses for a specific property, optionally filtered by category',
    {
      taxYearId: z.string(),
      propertyId: z.string(),
      category: z.nativeEnum(RentalExpenseCategory).optional(),
    },
    async ({ taxYearId, propertyId, category }) => {
      let q = rentalExpensesCol(userId, taxYearId, propertyId).orderBy('date', 'desc') as FirebaseFirestore.Query;
      if (category) q = q.where('category', '==', category);
      const snap = await q.get();
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] };
    }
  );

  server.tool(
    'add_rental_expense',
    'Record a rental expense for a specific property',
    {
      taxYearId: z.string(),
      propertyId: z.string(),
      category: z.nativeEnum(RentalExpenseCategory),
      amount: z.number().positive(),
      date: z.string().date().describe('ISO date string YYYY-MM-DD'),
      description: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    },
    async ({ taxYearId, propertyId, ...data }) => {
      const parsed = createRentalExpenseSchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const ref = await rentalExpensesCol(userId, taxYearId, propertyId).add({
        ...parsed.data,
        date: new Date(parsed.data.date),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const doc = await ref.get();
      return { content: [{ type: 'text', text: JSON.stringify({ id: doc.id, ...doc.data() }) }] };
    }
  );
}
