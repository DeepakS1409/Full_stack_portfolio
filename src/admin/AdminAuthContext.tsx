import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  checkIsAuthorizedAdmin,
  getAdminAuthState,
  signInAdmin,
  signOutAdmin,
} from '@/services/auth.service';

interface AdminAuthContextValue {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const state = await getAdminAuthState();
        if (!mounted) return;
        setSession(state.session);
        setUser(state.user);
        setIsAdmin(state.isAdmin);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void init();

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false;
      };
    }

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        void checkIsAuthorizedAdmin(nextSession.user.id).then((authorized) => {
          if (mounted) setIsAdmin(authorized);
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInAdmin(email, password);
    setSession(result.session);
    setUser(result.user);
    setIsAdmin(result.isAdmin);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ session, user, isAdmin, loading, signIn, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  }
  return ctx;
}

