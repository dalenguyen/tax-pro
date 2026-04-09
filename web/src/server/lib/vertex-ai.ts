import { VertexAI } from '@google-cloud/vertexai';

const projectId = process.env['GCP_PROJECT_ID'] || '';
const location = process.env['GCP_LOCATION'] || 'northamerica-northeast2';

let vertexAI: VertexAI | null = null;

function getVertexAI() {
  if (!vertexAI) {
    vertexAI = new VertexAI({ project: projectId, location });
  }
  return vertexAI;
}

export interface ExtractionResult {
  vendor?: string;
  amount?: number;
  currency?: string;
  date?: string;
  category?: string;
  lineItems?: Array<{ description: string; amount: number }>;
  taxAmount?: number;
  subtotal?: number;
}

export async function extractReceiptData(
  gcsUri: string,
  mimeType: string,
): Promise<ExtractionResult> {
  const model = getVertexAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Analyze this receipt/invoice image and extract the following as JSON:
{
  "vendor": "business/store name",
  "amount": total amount as number,
  "currency": "CAD" or "USD",
  "date": "YYYY-MM-DD",
  "category": "one of: EMAIL, GCP, NAMECHEAP, PHONE, INTERNET, ADS, HOSTING, OTHER",
  "lineItems": [{"description": "item", "amount": number}],
  "taxAmount": tax amount or null,
  "subtotal": subtotal or null
}
Return ONLY valid JSON. Use null for unknown fields.`;

  const response = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { fileData: { fileUri: gcsUri, mimeType } },
        { text: prompt },
      ],
    }],
  });

  const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned) as ExtractionResult;
  } catch {
    console.error('Failed to parse Gemini response:', text);
    return {};
  }
}
