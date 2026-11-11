import { useCallback, useEffect, useState } from 'react';
import { Archive, Check, Mail, Trash2 } from 'lucide-react';
import {
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from '@/services/contact.service';
import type { ContactMessageItem } from '@/types/portfolio.types';

export function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await getContactMessages());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatus = async (
    id: string,
    status: ContactMessageItem['status'],
  ) => {
    await updateContactMessageStatus(id, status);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this contact message permanently?')) return;
    await deleteContactMessage(id);
    await load();
  };

  return (
    <div className="glass-panel" style={{ padding: '1.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
        <Mail size={19} color="var(--accent-cyan)" />
        <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem' }}>
          Contact Messages Inbox ({messages.length})
        </h2>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading messages...</div>
      ) : error ? (
        <div style={{ color: '#fecaca' }}>{error}</div>
      ) : messages.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', padding: '1.5rem 0' }}>
          No contact form submissions yet.
        </div>
      ) : (
        <div className="admin-list">
          {messages.map((m) => (
            <div key={m.id} className="admin-item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.subject}</div>
                  <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    From: {m.senderName} &lt;{m.senderEmail}&gt; ·{' '}
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`admin-badge ${
                    m.status === 'unread' ? 'admin-badge-draft' : 'admin-badge-published'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {m.message}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {m.status !== 'read' && (
                  <button
                    type="button"
                    onClick={() => void handleStatus(m.id, 'read')}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    <Check size={13} />
                    Mark Read
                  </button>
                )}
                {m.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => void handleStatus(m.id, 'archived')}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    <Archive size={13} />
                    Archive
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleDelete(m.id)}
                  className="glass-btn glass-btn-secondary"
                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: '#fca5a5' }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

