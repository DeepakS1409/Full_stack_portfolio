import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { ContactMessageItem } from '@/types/portfolio.types';

export interface SubmitContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Invisible honeypot field; must remain empty */
  website?: string;
}

export interface SubmitContactResponse {
  success: boolean;
  id: string;
  createdAt: string;
}

export async function submitContactMessage(
  input: SubmitContactInput,
): Promise<SubmitContactResponse> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Backend contact endpoint is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<
    SubmitContactResponse & { error?: string }
  >('submit-contact', {
    body: {
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      website: input.website ?? '',
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to submit message.');
  }

  if (!data || data.error || !data.success) {
    throw new Error(data?.error ?? 'Message submission failed.');
  }

  return data;
}

interface ContactMessageRow {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

function mapContactRow(row: ContactMessageRow): ContactMessageItem {
  return {
    id: row.id,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getContactMessages(): Promise<ContactMessageItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, sender_name, sender_email, subject, message, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load contact messages: ${error.message}`);
  }

  return ((data ?? []) as ContactMessageRow[]).map(mapContactRow);
}

export async function updateContactMessageStatus(
  id: string,
  status: 'unread' | 'read' | 'archived',
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update message status: ${error.message}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

