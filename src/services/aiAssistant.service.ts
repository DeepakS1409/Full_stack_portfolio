import { getSupabaseClient } from '@/lib/supabase';
import type { AssistantMode, PersonalKnowledgeItem } from '@/types/portfolio.types';

interface KnowledgeRow {
  id: string;
  title: string;
  source_type: PersonalKnowledgeItem['sourceType'];
  tags: unknown;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapKnowledgeRow(row: KnowledgeRow): PersonalKnowledgeItem {
  return {
    id: row.id,
    title: row.title,
    sourceType: row.source_type,
    tags: Array.isArray(row.tags)
      ? row.tags.filter((t): t is string => typeof t === 'string')
      : [],
    content: row.content,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPersonalKnowledge(): Promise<PersonalKnowledgeItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('personal_knowledge')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch personal knowledge: ${error.message}`);
  }

  return ((data ?? []) as KnowledgeRow[]).map(mapKnowledgeRow);
}

export async function createPersonalKnowledge(input: {
  title: string;
  sourceType: PersonalKnowledgeItem['sourceType'];
  tags: string[];
  content: string;
  isActive?: boolean;
}): Promise<PersonalKnowledgeItem> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('personal_knowledge')
    .insert({
      title: input.title.trim(),
      source_type: input.sourceType,
      tags: input.tags,
      content: input.content.trim(),
      is_active: input.isActive ?? true,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to save knowledge entry: ${error?.message ?? 'Unknown error'}`);
  }

  return mapKnowledgeRow(data as KnowledgeRow);
}

export async function updatePersonalKnowledge(
  id: string,
  input: Partial<{
    title: string;
    sourceType: PersonalKnowledgeItem['sourceType'];
    tags: string[];
    content: string;
    isActive: boolean;
  }>,
): Promise<PersonalKnowledgeItem> {
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.sourceType !== undefined) patch.source_type = input.sourceType;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.content !== undefined) patch.content = input.content.trim();
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  const { data, error } = await supabase
    .from('personal_knowledge')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update knowledge entry: ${error?.message ?? 'Unknown error'}`);
  }

  return mapKnowledgeRow(data as KnowledgeRow);
}

export async function deletePersonalKnowledge(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('personal_knowledge').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete knowledge entry: ${error.message}`);
  }
}

export interface AdminAssistantResponse {
  reply: string;
  mode: AssistantMode;
  model: string;
  knowledgeEntriesUsed: number;
  generatedAt: string;
}

export async function askAdminAssistant(params: {
  mode: AssistantMode;
  prompt: string;
  context?: Record<string, unknown>;
}): Promise<AdminAssistantResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<
    AdminAssistantResponse & { error?: string }
  >('ai-assistant', {
    body: params,
  });

  if (error) {
    throw new Error(error.message || 'AI assistant request failed.');
  }

  if (!data || data.error || !data.reply) {
    throw new Error(data?.error ?? 'AI assistant returned an empty reply.');
  }

  return data;
}

