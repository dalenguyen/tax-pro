import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { receiptsCol } from '@cantax-fyi/db';
import { createReceiptSchema } from '@cantax-fyi/utils';
import { ReceiptStatus } from '@cantax-fyi/types';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const body = await readBody(event);
  const parsed = createReceiptSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const data = parsed.data;

  const docRef = await receiptsCol(userId, taxYearId).add({
    fileName: data.fileName,
    mimeType: data.mimeType,
    fileSize: data.fileSize,
    storagePath: data.storagePath,
    status: ReceiptStatus.PENDING,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
});
