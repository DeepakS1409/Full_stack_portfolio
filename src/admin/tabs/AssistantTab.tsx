import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { BookOpen, Bot, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import {
  askAdminAssistant,
  createPersonalKnowledge,
  deletePersonalKnowledge,
  getPersonalKnowledge,
} from '@/services/aiAssistant.service';
import type { AssistantMode, PersonalKnowledgeItem } from '@/types/portfolio.types';

export function AssistantTab() {
  const [mode, setMode] = useState<AssistantMode>('certificate_description');
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const [knowledge, setKnowledge] = useState<PersonalKnowledgeItem[]>([]);
  const [kTitle, setKTitle] = useState('');
  const [kSource, setKSource] = useState<PersonalKnowledgeItem['sourceType']>('manual');
  const [kTags, setKTags] = useState('');
  const [kContent, setKContent] = useState('');
  const [savingK, setSavingK] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKnowledge = useCallback(async () => {
    try {
      const data = await getPersonalKnowledge();
      setKnowledge(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load knowledge base.');
    }
  }, []);

  useEffect(() => {
    void loadKnowledge();
  }, [loadKnowledge]);

  const handleAsk = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setAsking(true);
    setError(null);
    try {
      const res = await askAdminAssistant({ mode, prompt });
      setReply(res.reply);
      setMeta(
        `${res.model} · ${res.knowledgeEntriesUsed} active knowledge note(s) grounded`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assistant call failed.');
    } finally {
      setAsking(false);
    }
  };

  const handleAddKnowledge = async (e: FormEvent) => {
    e.preventDefault();
    if (!kTitle.trim() || !kContent.trim()) return;
    setSavingK(true);
    setError(null);
    try {
      await createPersonalKnowledge({
        title: kTitle,
        sourceType: kSource,
        tags: kTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        content: kContent,
      });
      setKTitle('');
      setKTags('');
      setKContent('');
      await loadKnowledge();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save knowledge note.');
    } finally {
      setSavingK(false);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    try {
      await deletePersonalKnowledge(id);
      await loadKnowledge();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="admin-two-col">
      {/* Left: Personalized Admin AI Assistant */}
      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
          <Bot size={19} color="var(--accent-cyan)" />
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem' }}>
            Admin AI Assistant
          </h2>
        </div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Grounded strictly in your stored Supabase portfolio records and manually supplied knowledge base entries. Private to admin.
        </p>

        <form onSubmit={(e) => void handleAsk(e)} className="admin-form-grid">
          <div>
            <label className="admin-label">Assistant Task Mode</label>
            <select
              className="glass-input"
              value={mode}
              onChange={(e) => setMode(e.target.value as AssistantMode)}
            >
              <option value="certificate_description">Write Certificate Description</option>
              <option value="linkedin_post">Draft LinkedIn Achievement Post</option>
              <option value="project_summary">Summarize Project Information</option>
              <option value="category_suggestion">Suggest Portfolio Categories</option>
              <option value="clarity_polish">Improve Grammar & Clarity</option>
              <option value="portfolio_qa">Answer Question About Stored Data</option>
            </select>
          </div>

          <div>
            <label className="admin-label">Instruction / Context</label>
            <textarea
              rows={4}
              className="glass-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a concise LinkedIn-style summary of my Ziro Agentic AI Hackathon 2026 rank #132 achievement..."
            />
          </div>

          <button type="submit" disabled={asking} className="glass-btn glass-btn-primary">
            {asking ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send size={15} />
                Ask Assistant
              </>
            )}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '0.9rem', color: '#fecaca', fontSize: '0.84rem' }}>
            {error}
          </div>
        )}

        {reply && (
          <div
            style={{
              marginTop: '1.1rem',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(8, 12, 23, 0.72)',
              border: '1px solid rgba(34, 211, 238, 0.25)',
            }}
          >
            {meta && (
              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                {meta}
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.65 }}>
              {reply}
            </div>
          </div>
        )}
      </div>

      {/* Right: Private Personal Knowledge Base */}
      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
          <BookOpen size={19} color="var(--accent-violet)" />
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem' }}>
            Personal Knowledge Base ({knowledge.length})
          </h2>
        </div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Add curated career notes or paste exported summaries from prior ChatGPT discussions. Never exposed to public visitors.
        </p>

        <form onSubmit={(e) => void handleAddKnowledge(e)} className="admin-form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-row-2">
            <div>
              <label className="admin-label">Entry Title</label>
              <input
                type="text"
                className="glass-input"
                value={kTitle}
                onChange={(e) => setKTitle(e.target.value)}
                placeholder="e.g. FactoryMind AI Design Notes"
              />
            </div>
            <div>
              <label className="admin-label">Source Type</label>
              <select
                className="glass-input"
                value={kSource}
                onChange={(e) =>
                  setKSource(e.target.value as PersonalKnowledgeItem['sourceType'])
                }
              >
                <option value="manual">Manual Note</option>
                <option value="chatgpt_export">Exported ChatGPT Summary</option>
                <option value="project_note">Project Note</option>
                <option value="career_note">Career Note</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="glass-input"
              value={kTags}
              onChange={(e) => setKTags(e.target.value)}
              placeholder="ai, hackathon, projects"
            />
          </div>

          <div>
            <label className="admin-label">Curated Knowledge Content</label>
            <textarea
              rows={3}
              className="glass-input"
              value={kContent}
              onChange={(e) => setKContent(e.target.value)}
              placeholder="Paste factual notes or discussion summaries here..."
            />
          </div>

          <button type="submit" disabled={savingK} className="glass-btn glass-btn-secondary">
            <Plus size={15} />
            {savingK ? 'Saving...' : 'Add Knowledge Entry'}
          </button>
        </form>

        <div className="admin-list">
          {knowledge.map((item) => (
            <div key={item.id} className="admin-item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>{item.title}</div>
                  <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    {item.sourceType}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteKnowledge(item.id)}
                  className="glass-btn glass-btn-secondary"
                  style={{ padding: '0.32rem 0.6rem', color: '#fca5a5' }}
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

