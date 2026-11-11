import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export interface AdminAuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
}

export async function checkIsAuthorizedAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function getAdminAuthState(): Promise<AdminAuthState> {
  if (!isSupabaseConfigured) {
    return { session: null, user: null, isAdmin: false };
  }

  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { session: null, user: null, isAdmin: false };
  }

  const isAdmin = await checkIsAuthorizedAdmin(session.user.id);
  return {
    session,
    user: session.user,
    isAdmin,
  };
}

export async function signInAdmin(
  email: string,
  password: string,
): Promise<AdminAuthState> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? 'Invalid login credentials.');
  }

  const isAdmin = await checkIsAuthorizedAdmin(data.user.id);
  if (!isAdmin) {
    await supabase.auth.signOut();
    throw new Error(
      'This account is authenticated but not authorized in public.admin_users.',
    );
  }

  return {
    session: data.session,
    user: data.user,
    isAdmin: true,
  };
}

export async function signOutAdmin(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

