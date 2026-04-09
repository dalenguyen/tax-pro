import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { receiptDoc } from '@can-tax-pro/db';
import { extractReceiptData } from '../../../../lib/vertex-ai';
import { FieldValue } from 'firebase-admin/firestore';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = receiptDoc(TEST_USER_ID, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Receipt not found' });
  }

  const data = doc.data()!;
  const bucketName = process.env['GCS_BUCKET'] || 'can-tax-pro-receipts-dev';
  const gcsUri = `gs://${bucketName}/${data.storagePath}`;

  await ref.update({ status: 'PROCESSING', updatedAt: FieldValue.serverTimestamp() });

  try {
    const extracted = await extractReceiptData(gcsUri, data.mimeType);
    await ref.update({
      status: 'EXTRACTED',
      extractedVendor: extracted.vendor || null,
      extractedAmount: extracted.amount || null,
      extractedCurrency: extracted.currency || null,
      extractedDate: extracted.date ? new Date(extracted.date) : null,
      extractedCategory: extracted.category || null,
      extractedRaw: extracted,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updated = await ref.get();
    return { id: updated.id, ...updated.data(), extracted };
  } catch (error) {
    await ref.update({
      status: 'FAILED',
      extractedRaw: { error: String(error) },
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw createError({ statusCode: 500, statusMessage: `Extraction failed: ${error}` });
  }
});
