import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { receiptsCol, receiptDoc } from '@can-tax-pro/db';
import { ReceiptStatus } from '@can-tax-pro/types';

export function registerReceiptTools(server: McpServer, userId: string) {
  server.tool(
    'list_receipts',
    'List receipts for a tax year, optionally filtered by status',
    {
      taxYearId: z.string(),
      status: z.nativeEnum(ReceiptStatus).optional(),
    },
    async ({ taxYearId, status }) => {
      let q = receiptsCol(userId, taxYearId).orderBy('createdAt', 'desc') as FirebaseFirestore.Query;
      if (status) q = q.where('status', '==', status);
      const snap = await q.get();
      const receipts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { content: [{ type: 'text', text: JSON.stringify(receipts, null, 2) }] };
    }
  );

  server.tool(
    'get_receipt',
    'Get a single receipt by ID',
    { taxYearId: z.string(), receiptId: z.string() },
    async ({ taxYearId, receiptId }) => {
      const doc = await receiptDoc(userId, taxYearId, receiptId).get();
      if (!doc.exists) throw new Error(`Receipt ${receiptId} not found`);
      return { content: [{ type: 'text', text: JSON.stringify({ id: doc.id, ...doc.data() }) }] };
    }
  );
}
