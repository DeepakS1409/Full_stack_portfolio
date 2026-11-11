import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Edit3, Eye, EyeOff, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import {
  createAchievementAdmin,
  deleteAchievementAdmin,
  getAllAchievementsAdmin,
  updateAchievementAdmin,
} from '@/services/portfolio.service';
import { uploadFileToBucket } from '@/services/storage.service';
import type { AchievementItem } from '@/types/portfolio.types';

interface AchievementFormState {
  editingId: string | null;
  title: string;
  subtitle: string;
  organization: string;
  year: string;
  badgeText: string;
  description: string;
  accent: 'cyan' | 'blue' | 'violet';
  imageUrl: string;
  storagePath: string | null;
  isPublished: boolean;
}

const EMPTY_FORM: AchievementFormState = {
  editingId: null,
  title: '',
  subtitle: '',
  organization: '',
  year: '2026',
  badgeText: '',
  description: '',
  accent: 'cyan',
  imageUrl: '',
  storagePath: null,
  isPublished: true,
};

export function AchievementsTab() {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<AchievementFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAllAchievementsAdmin());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const uploaded = await uploadFileToBucket('portfolio-achievements', file, 'achievements');
      setForm((prev) => ({
        ...prev,
        imageUrl: uploaded.publicUrl,
        storagePath: uploaded.storagePath,
      }));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.organization.trim() || !form.description.trim()) {
      setMsg('Title, organization, and description are required.');
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        organization: form.organization,
        year: form.year,
        badgeText: form.badgeText,
        description: form.description,
        accent: form.accent,
        imageUrl: form.imageUrl || null,
        storagePath: form.storagePath,
        isPublished: form.isPublished,
      };
      if (form.editingId) {
        await updateAchievementAdmin(form.editingId, payload);
        setMsg('Achievement updated.');
      } else {
        await createAchievementAdmin(payload);
        setMsg('Achievement added.');
      }
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: AchievementItem) => {
    setForm({
      editingId: item.id,
      title: item.title,
      subtitle: item.subtitle,
      organization: item.organization,
      year: item.year,
      badgeText: item.badgeText,
      description: item.description,
      accent: item.accent,
      imageUrl: item.imageUrl ?? '',
      storagePath: item.storagePath ?? null,
      isPublished: item.isPublished ?? true,
    });
  };

  const handleToggle = async (item: AchievementItem) => {
    await updateAchievementAdmin(item.id, { isPublished: !(item.isPublished ?? true) });
    await load();
  };

  const handleDelete = async (item: AchievementItem) => {
    if (!window.confirm(`Delete achievement "${item.title}"?`)) return;
    await deleteAchievementAdmin(item.id, item.storagePath);
    if (form.editingId === item.id) setForm(EMPTY_FORM);
    await load();
  };

  return (
    <div className="admin-two-col">
      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem' }}>
            {form.editingId ? 'Edit Achievement' : 'Add Achievement'}
          </h2>
          {form.editingId && (
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className="glass-btn glass-btn-secondary"
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
            >
              <Plus size={14} />
              New
            </button>
          )}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="admin-form-grid">
          <div>
            <label className="admin-label">Title *</label>
            <input
              type="text"
              className="glass-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="admin-row-2">
            <div>
              <label className="admin-label">Organization *</label>
              <input
                type="text"
                className="glass-input"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Date / Year *</label>
              <input
                type="text"
                className="glass-input"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-row-2">
            <div>
              <label className="admin-label">Badge Text</label>
              <input
                type="text"
                className="glass-input"
                value={form.badgeText}
                onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Accent Color</label>
              <select
                className="glass-input"
                value={form.accent}
                onChange={(e) =>
                  setForm({ ...form, accent: e.target.value as 'cyan' | 'blue' | 'violet' })
                }
              >
                <option value="cyan">Cyan</option>
                <option value="blue">Electric Blue</option>
                <option value="violet">Violet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Description *</label>
            <textarea
              rows={3}
              className="glass-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
            <label className="glass-btn glass-btn-secondary" style={{ cursor: 'pointer' }}>
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Optional Supporting Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => void handleImageUpload(e.target.files?.[0])}
              />
            </label>
            {form.imageUrl && (
              <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>
                Image attached
              </span>
            )}
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Publish publicly
          </label>

          {msg && (
            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              {msg}
            </div>
          )}

          <button type="submit" disabled={saving} className="glass-btn glass-btn-primary">
            {saving ? 'Saving...' : form.editingId ? 'Update Achievement' : 'Add Achievement'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
          Achievements ({items.length})
        </h2>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="admin-list">
            {items.map((item) => (
              <div key={item.id} className="admin-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {item.organization} · {item.year}
                    </div>
                  </div>
                  <span
                    className={`admin-badge ${
                      item.isPublished ? 'admin-badge-published' : 'admin-badge-draft'
                    }`}
                  >
                    {item.isPublished ? 'published' : 'draft'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.36rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggle(item)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.36rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    {item.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                    {item.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.36rem 0.7rem', fontSize: '0.78rem', color: '#fca5a5' }}
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
    </div>
  );
}

