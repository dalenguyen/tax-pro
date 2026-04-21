import type { DocumentSnapshot } from 'firebase-admin/firestore';

function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') {
    if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
    if (Array.isArray(value)) return value.map(serializeValue);
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serializeValue(v)])
    );
  }
  return value;
}

export function serializeDoc(doc: DocumentSnapshot): Record<string, unknown> {
  return { id: doc.id, ...(serializeValue(doc.data()) as object) };
}

export function serializeDocs(docs: DocumentSnapshot[]): Record<string, unknown>[] {
  return docs.map(serializeDoc);
}
