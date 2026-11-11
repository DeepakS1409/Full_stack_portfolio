import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Edit3, Eye, EyeOff, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import {
  createProjectAdmin,
  deleteProjectAdmin,
  getAllProjectsAdmin,
  updateProjectAdmin,
} from '@/services/portfolio.service';
import { uploadFileToBucket } from '@/services/storage.service';
import type { ProjectItem } from '@/types/portfolio.types';

interface ProjectFormState {
  editingId: string | null;
  name: string;
  tagline: string;
  category: string;
  statusLabel: string;
  description: string;
  details: string;
  technologiesText: string;
  highlightsText: string;
  imageUrl: string;
  storagePath: string | null;
  githubUrl: string;
  liveUrl: string;
  isPublished: boolean;
}

const EMPTY_PROJECT: ProjectFormState = {
  editingId: null,
  name: '',
  tagline: '',
  category: 'Web Application',
  statusLabel: 'Project Build',
  description: '',
  details: '',
  technologiesText: '',
  highlightsText: '',
  imageUrl: '',
  storagePath: null,
  githubUrl: '',
  liveUrl: '',
  isPublished: true,
};

export function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_PROJECT);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await getAllProjectsAdmin());
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
      const uploaded = await uploadFileToBucket('portfolio-projects', file, 'projects');
      setForm((prev) => ({
        ...prev,
        imageUrl: uploaded.publicUrl,
        storagePath: uploaded.storagePath,
      }));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setMsg('Project name and short description are required.');
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline,
        category: form.category,
        statusLabel: form.statusLabel,
        description: form.description,
        details: form.details || form.description,
        technologies: form.technologiesText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        highlights: form.highlightsText
          .split('\n')
          .map((h) => h.trim())
          .filter(Boolean),
        imageUrl: form.imageUrl || null,
        storagePath: form.storagePath,
        githubUrl: form.githubUrl || null,
        liveUrl: form.liveUrl || null,
        isPublished: form.isPublished,
      };

      if (form.editingId) {
        await updateProjectAdmin(form.editingId, payload);
        setMsg('Project updated.');
      } else {
        await createProjectAdmin(payload);
        setMsg('Project created.');
      }
      setForm(EMPTY_PROJECT);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: ProjectItem) => {
    setForm({
      editingId: p.id,
      name: p.name,
      tagline: p.tagline,
      category: p.category,
      statusLabel: p.statusLabel,
      description: p.description,
      details: p.details,
      technologiesText: p.technologies.join(', '),
      highlightsText: p.highlights.join('\n'),
      imageUrl: p.isPlaceholderImage ? '' : p.imageUrl,
      storagePath: p.storagePath ?? null,
      githubUrl: p.githubUrl ?? '',
      liveUrl: p.liveUrl ?? '',
      isPublished: p.isPublished ?? true,
    });
  };

  const handleToggle = async (p: ProjectItem) => {
    await updateProjectAdmin(p.id, { isPublished: !(p.isPublished ?? true) });
    await load();
  };

  const handleDelete = async (p: ProjectItem) => {
    if (!window.confirm(`Delete project "${p.name}"?`)) return;
    await deleteProjectAdmin(p.id, p.storagePath);
    if (form.editingId === p.id) setForm(EMPTY_PROJECT);
    await load();
  };

  return (
    <div className="admin-two-col">
      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem' }}>
            {form.editingId ? 'Edit Project' : 'Add Project'}
          </h2>
          {form.editingId && (
            <button
              type="button"
              onClick={() => setForm(EMPTY_PROJECT)}
              className="glass-btn glass-btn-secondary"
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
            >
              <Plus size={14} />
              New
            </button>
          )}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="admin-form-grid">
          <div className="admin-row-2">
            <div>
              <label className="admin-label">Project Name *</label>
              <input
                type="text"
                className="glass-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Category</label>
              <input
                type="text"
                className="glass-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-row-2">
            <div>
              <label className="admin-label">Tagline</label>
              <input
                type="text"
                className="glass-input"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Status Label</label>
              <input
                type="text"
                className="glass-input"
                value={form.statusLabel}
                onChange={(e) => setForm({ ...form, statusLabel: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Short Description *</label>
            <textarea
              rows={2}
              className="glass-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Detailed Overview</label>
            <textarea
              rows={3}
              className="glass-input"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Technologies (comma-separated)</label>
            <input
              type="text"
              className="glass-input"
              value={form.technologiesText}
              onChange={(e) => setForm({ ...form, technologiesText: e.target.value })}
              placeholder="React, TypeScript, Python"
            />
          </div>

          <div>
            <label className="admin-label">Key Highlights (one per line)</label>
            <textarea
              rows={3}
              className="glass-input"
              value={form.highlightsText}
              onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
            />
          </div>

          <div className="admin-row-2">
            <div>
              <label className="admin-label">GitHub URL</label>
              <input
                type="url"
                className="glass-input"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Live Demo URL</label>
              <input
                type="url"
                className="glass-input"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
            <label className="glass-btn glass-btn-secondary" style={{ cursor: 'pointer' }}>
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Upload Project Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => void handleImageUpload(e.target.files?.[0])}
              />
            </label>
            {form.imageUrl && (
              <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>
                Image ready
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
            {saving ? 'Saving...' : form.editingId ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
          Projects ({projects.length})
        </h2>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="admin-list">
            {projects.map((p) => (
              <div key={p.id} className="admin-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {p.category} · {p.statusLabel}
                    </div>
                  </div>
                  <span
                    className={`admin-badge ${
                      p.isPublished ? 'admin-badge-published' : 'admin-badge-draft'
                    }`}
                  >
                    {p.isPublished ? 'published' : 'draft'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {p.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.36rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggle(p)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.36rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    {p.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                    {p.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(p)}
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

