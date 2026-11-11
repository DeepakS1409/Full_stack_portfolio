import { createServiceClient } from '../_shared/auth.ts';
import { handleCorsPreflight, jsonResponse } from '../_shared/cors.ts';

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  /** Honeypot field — must stay empty */
  website?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  try {
    const raw = (await req.json()) as ContactPayload;

    // Honeypot spam check: bots that fill hidden `website` field are rejected
    if (sanitizeText(raw.website).length > 0) {
      return jsonResponse({ error: 'Spam check failed.' }, 400);
    }

    const name = sanitizeText(raw.name);
    const email = sanitizeText(raw.email).toLowerCase();
    const subject = sanitizeText(raw.subject);
    const message = sanitizeText(raw.message);

    if (name.length < 2 || name.length > 120) {
      return jsonResponse({ error: 'Name must be between 2 and 120 characters.' }, 400);
    }
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return jsonResponse({ error: 'Please provide a valid email address.' }, 400);
    }
    if (subject.length < 3 || subject.length > 200) {
      return jsonResponse({ error: 'Subject must be between 3 and 200 characters.' }, 400);
    }
    if (message.length < 10 || message.length > 4000) {
      return jsonResponse({ error: 'Message must be between 10 and 4000 characters.' }, 400);
    }

    const adminClient = createServiceClient();

    const forwardedFor = req.headers.get('x-forwarded-for') ?? 'unknown';
    const clientIp = forwardedFor.split(',')[0]?.trim() || 'unknown';
    const salt = Deno.env.get('RATE_LIMIT_SALT') ?? 'portfolio-contact-salt';
    const ipHash = await sha256Hex(`${salt}:${clientIp}`);

    // Rate limit: max 3 messages per IP hash in 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recentIpCount, error: countError } = await adminClient
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', fifteenMinutesAgo);

    if (countError) {
      return jsonResponse({ error: 'Unable to validate request rate limit.' }, 500);
    }

    if ((recentIpCount ?? 0) >= 3) {
      return jsonResponse(
        { error: 'Too many messages sent recently. Please wait a few minutes and try again.' },
        429,
      );
    }

    const userAgent = sanitizeText(req.headers.get('user-agent')).slice(0, 250);

    const { data: inserted, error: insertError } = await adminClient
      .from('contact_messages')
      .insert({
        sender_name: name,
        sender_email: email,
        subject,
        message,
        status: 'unread',
        ip_hash: ipHash,
        user_agent: userAgent || null,
      })
      .select('id, created_at')
      .single();

    if (insertError || !inserted) {
      return jsonResponse(
        { error: 'Failed to store your message in the database.' },
        500,
      );
    }

    return jsonResponse(
      {
        success: true,
        id: inserted.id,
        createdAt: inserted.created_at,
      },
      201,
    );
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Invalid request payload.' },
      400,
    );
  }
});

