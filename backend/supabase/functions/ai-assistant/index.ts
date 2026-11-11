import { AuthError, requireAdmin } from '../_shared/auth.ts';
import { handleCorsPreflight, jsonResponse } from '../_shared/cors.ts';

type AssistantMode =
  | 'certificate_description'
  | 'linkedin_post'
  | 'project_summary'
  | 'category_suggestion'
  | 'clarity_polish'
  | 'portfolio_qa';

interface AiAssistantRequest {
  mode?: AssistantMode;
  prompt: string;
  context?: Record<string, unknown>;
}

const MODE_INSTRUCTIONS: Record<AssistantMode, string> = {
  certificate_description:
    'Write a concise, factual 1-2 sentence portfolio certificate description without embellishing unverified claims.',
  linkedin_post:
    'Draft a polished, authentic LinkedIn post highlighting the milestone honestly for an undergraduate B.Tech IT student.',
  project_summary:
    'Summarize the project clearly for a technical portfolio card and modal, distinguishing concepts from deployed builds.',
  category_suggestion:
    'Recommend the clearest portfolio category and tags based strictly on the provided metadata.',
  clarity_polish:
    'Improve grammar, flow, and editorial tone while keeping every fact accurate and unchanged.',
  portfolio_qa:
    'Answer the admin question accurately using only the stored portfolio records and owner-supplied knowledge base.',
};

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

    const body = (await req.json()) as AiAssistantRequest;
    const prompt = body.prompt?.trim();
    if (!prompt || prompt.length > 4000) {
      return jsonResponse({ error: 'Prompt must be between 1 and 4000 characters.' }, 400);
    }

    const mode: AssistantMode =
      body.mode && body.mode in MODE_INSTRUCTIONS ? body.mode : 'portfolio_qa';

    // Load authorized portfolio context + curated private owner knowledge base
    const [
      { data: profile },
      { data: certificates },
      { data: projects },
      { data: achievements },
      { data: skills },
      { data: education },
      { data: knowledge },
    ] = await Promise.all([
      adminClient.from('profiles').select('name, degree, college, batch, professional_title, hero_intro').limit(1).maybeSingle(),
      adminClient.from('certificates').select('title, organization, year, issue_date, category, credential_id, description, highlights, status').order('sort_order'),
      adminClient.from('projects').select('name, tagline, category, status_label, description, technologies, is_published').order('sort_order'),
      adminClient.from('achievements').select('title, subtitle, organization, achieved_date, badge_text, description, is_published').order('sort_order'),
      adminClient.from('skills').select('kind, group_title, name, focus_note').order('sort_order'),
      adminClient.from('education').select('degree, institution, period, status_label, description').order('sort_order'),
      adminClient.from('personal_knowledge').select('title, source_type, tags, content, updated_at').eq('is_active', true).order('updated_at', { ascending: false }).limit(25),
    ]);

    const groundedContext = {
      profile,
      education,
      skills,
      projects,
      achievements,
      certificates,
      curated_owner_knowledge: knowledge ?? [],
      request_context: body.context ?? null,
    };

    const systemPrompt = [
      'You are the private Portfolio Admin AI Assistant for Deepak S.',
      `Task mode: ${mode} — ${MODE_INSTRUCTIONS[mode]}`,
      'GROUNDING & HONESTY RULES:',
      '1. Use ONLY the authorized portfolio records and curated_owner_knowledge supplied in this request.',
      '2. Never claim direct access to the owner\'s external ChatGPT account, private chat history, or unprovided memories.',
      '3. Never invent work experience, GPA, unverified rankings, live links, or completed deliverables.',
      '4. If requested information is missing from the authorized knowledge base and database records, state clearly what is missing.',
    ].join('\n');

    const model = Deno.env.get('OPENAI_ASSISTANT_MODEL') ?? 'gpt-4o-mini';

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
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
                text: `Authorized Knowledge & Portfolio Context:\n${JSON.stringify(groundedContext)}\n\nAdmin Request:\n${prompt}`,
              },
            ],
          },
        ],
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
    const reply: string =
      aiPayload.output_text ??
      aiPayload.output?.[0]?.content?.find((c: { type?: string; text?: string }) => c.type === 'output_text')?.text ??
      '';

    return jsonResponse({
      reply,
      mode,
      model,
      knowledgeEntriesUsed: knowledge?.length ?? 0,
      generatedAt: new Date().toISOString(),
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

