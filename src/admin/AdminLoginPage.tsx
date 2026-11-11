import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAdminAuth } from './AdminAuthContext';
import './admin.css';

interface AdminLoginPageProps {
  onNavigateHome: () => void;
}

export function AdminLoginPage({ onNavigateHome }: AdminLoginPageProps) {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError(
        'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) must be configured before signing in.',
      );
      return;
    }
    if (!email.trim() || !password) {
      setError('Enter both admin email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: 'clamp(1.5rem, 3vw, 2.2rem)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.35rem',
          }}
        >
          <span
            className="glass-pill font-mono"
            style={{ color: 'var(--accent-cyan)' }}
          >
            <ShieldCheck size={14} />
            Private Admin Portal
          </span>

          <button
            type="button"
            onClick={onNavigateHome}
            className="glass-btn glass-btn-secondary"
            style={{ padding: '0.42rem 0.78rem', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} />
            Portfolio
          </button>
        </div>

        <h1
          className="font-display text-gradient-subtle"
          style={{ margin: '0 0 0.45rem', fontSize: '1.65rem', fontWeight: 600 }}
        >
          Admin Sign In
        </h1>
        <p
          style={{
            margin: '0 0 1.4rem',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          Authenticate with your Supabase Admin account to manage certificates, projects, AI tools, and portfolio content.
        </p>

        {!isSupabaseConfigured && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              padding: '0.8rem 0.95rem',
              borderRadius: '10px',
              background: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.28)',
              fontSize: '0.82rem',
              color: '#fde68a',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Supabase is not configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> or Vercel.
            </span>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="admin-form-grid">
          <div>
            <label htmlFor="admin-email" className="admin-label">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="glass-input"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="admin-label">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="glass-input"
              disabled={submitting}
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '10px',
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                fontSize: '0.83rem',
                color: '#fecaca',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="glass-btn glass-btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: '0.35rem' }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying session...
              </>
            ) : (
              <>
                <Lock size={16} />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

