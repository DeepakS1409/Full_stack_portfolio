import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export class AuthError extends Error {
  public readonly status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireAdmin(
  req: Request,
): Promise<{ adminClient: SupabaseClient; user: User }> {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing Bearer authorization token.', 401);
  }

  const jwt = authHeader.slice('Bearer '.length).trim();
  if (!jwt) {
    throw new AuthError('Empty authorization token.', 401);
  }

  const adminClient = createServiceClient();
  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(jwt);

  if (userError || !user) {
    throw new AuthError('Invalid or expired authentication session.', 401);
  }

  const { data: adminRecord, error: adminError } = await adminClient
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError) {
    throw new AuthError('Unable to verify admin privileges.', 500);
  }

  if (!adminRecord) {
    throw new AuthError('Forbidden: account is not an authorized portfolio admin.', 403);
  }

  return { adminClient, user };
}

