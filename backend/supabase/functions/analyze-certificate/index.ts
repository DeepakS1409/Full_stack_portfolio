import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';
import { AuthError, requireAdmin } from '../_shared/auth.ts';
import { handleCorsPreflight, jsonResponse } from '../_shared/cors.ts';

interface AnalyzeCertificateRequest {
  storagePath?: string;
  mimeType?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'application/pdf',
]);

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const CERTIFICATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'organization',
    'recipient_name',
    'description',
    'issue_date',
    'year',
    'category',
    'credential_id',
    'achievement_details',
    'confidence',
    'fields_requiring_review',
  ],
  properties: {
    title: { type: ['string', 'null'] },
    organization: { type: ['string', 'null'] },
    recipient_name: { type: ['string', 'null'] },
    description: { type: ['string', 'null'] },
    issue_date: { type: ['string', 'null'] },
    year: { type: ['integer', 'null'] },
    category: {
      type: ['string', 'null'],
      enum: ['hackathon', 'membership', 'certification', 'workshop', null],
    },
    credential_id: { type: ['string', 'null'] },
    achievement_details: {
      type: 'array',
      items: { type: 'string' },
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
    },
    fields_requiring_review: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

function detectMimeFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return '';
}

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  try {
    const { adminClient } = await requireAdmin(req);

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      return jsonResponse(
        { error: 'OPENAI_API_KEY is not configured in Supabase Edge Function secrets.' },
        500,
      );
    }

    const body = (await req.json()) as AnalyzeCertificateRequest;
    const storagePath = body.storagePath?.trim();

    if (!storagePath || storagePath.includes('..')) {
      return jsonResponse({ error: 'A valid storagePath in portfolio-certificates is required.' }, 400);
    }

    const { data: fileBlob, error: downloadError } = await adminClient.storage
      .from('portfolio-certificates')
      .download(storagePath);

    if (downloadError || !fileBlob) {
      return jsonResponse(
        { error: `Failed to download certificate file from storage: ${downloadError?.message ?? 'Not found'}` },
        404,
      );
    }

    const mimeType =
      (body.mimeType && ALLOWED_MIME_TYPES.has(body.mimeType) ? body.mimeType : '') ||
      (ALLOWED_MIME_TYPES.has(fileBlob.type) ? fileBlob.type : '') ||
      detectMimeFromPath(storagePath);

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return jsonResponse(
        { error: 'Unsupported file format. Only PNG, JPG, JPEG, and PDF files are supported.' },
        400,
      );
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_BYTES) {
      return jsonResponse({ error: 'Certificate file exceeds the 10 MB analysis limit.' }, 400);
    }

    const base64Data = encodeBase64(new Uint8Array(arrayBuffer));
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const fileContentPart =
      mimeType === 'application/pdf'
        ? {
            type: 'input_file',
            filename: storagePath.split('/').pop() ?? 'certificate.pdf',
            file_data: dataUri,
          }
        : {
            type: 'input_image',
            image_url: dataUri,
            detail: 'high',
          };

    const model = Deno.env.get('OPENAI_VISION_MODEL') ?? 'gpt-4o-mini';

    const systemPrompt = [
      'You are an exact, security-conscious certificate extraction assistant for a personal engineering portfolio.',
      'Read ONLY the text and visual details actually visible on the uploaded certificate.',
      'STRICT RULES:',
      '1. Never invent, guess, or assume certificate details, ranks, scores, or achievements.',
      '2. Preserve exact recipient names, organization names, dates, scores, membership tiers, and credential IDs as printed.',
      '3. If a field is illegible, missing, or not printed on the certificate, return null for that field and include its field name in fields_requiring_review.',
      '4. For description, write a concise 1-2 sentence factual portfolio summary grounded strictly in what is visible on the certificate.',
      '5. Set confidence to "high" only when core fields (title, organization, recipient_name) are clearly legible; otherwise "medium" or "low".',
    ].join('\n');

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: systemPrompt }],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'Extract structured metadata from this uploaded certificate for admin review prior to publishing.',
              },
              fileContentPart,
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'certificate_extraction',
            strict: true,
            schema: CERTIFICATE_SCHEMA,
          },
        },
      }),
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      return jsonResponse(
        { error: `OpenAI API error (${openAiResponse.status}): ${errText.slice(0, 300)}` },
        502,
      );
    }

    const aiPayload = await openAiResponse.json();
    const rawOutputText: string =
      aiPayload.output_text ??
      aiPayload.output?.[0]?.content?.find((c: { type?: string; text?: string }) => c.type === 'output_text')?.text ??
      '';

    if (!rawOutputText) {
      return jsonResponse({ error: 'OpenAI returned an empty analysis response.' }, 502);
    }

    const extracted = JSON.parse(rawOutputText);

    return jsonResponse({
      extracted,
      model,
      requiresAdminApproval: true,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return jsonResponse({ error: err.message }, err.status);
    }
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unexpected server error.' },
      500,
    );
  }
});

