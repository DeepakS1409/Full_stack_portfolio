import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  analyzeCertificateWithAI,
  createCertificate,
  deleteCertificate,
  getCertificates,
  updateCertificate,
} from '@/services/certificate.service';
import { uploadFileToBucket } from '@/services/storage.service';
import type {
  Certificate,
  CertificateAssetType,
  CertificateCategory,
  CertificateExtractionResult,
  CertificateStatus,
} from '@/types/certificate.types';

interface CertFormState {
  editingId: string | null;
  title: string;
  organization: string;
  recipientName: string;
  issueDate: string;
  year: string;
  validUntil: string;
  credentialId: string;
  category: CertificateCategory;
  description: string;
  highlightsText: string;
  assetUrl: string;
  storagePath: string | null;
  assetType: CertificateAssetType;
  uploadedMimeType: string;
  status: CertificateStatus;
  aiExtraction: CertificateExtractionResult | null;
  aiReviewed: boolean;
}

const EMPTY_FORM: CertFormState = {
  editingId: null,
  title: '',
  organization: '',
  recipientName: 'Deepak S',
  issueDate: String(new Date().getFullYear()),
  year: String(new Date().getFullYear()),
  validUntil: '',
  credentialId: '',
  category: 'certification',
  description: '',
  highlightsText: '',
  assetUrl: '',
  storagePath: null,
  assetType: 'image',
  uploadedMimeType: '',
  status: 'draft',
  aiExtraction: null,
  aiReviewed: false,
};

export function CertificatesTab() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CertFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCertificates({ includeUnpublished: true });
      setItems(res.data);
    } catch (err) {
      setFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Failed to load certificates.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const uploaded = await uploadFileToBucket('portfolio-certificates', file, 'certificates');
      setForm((prev) => ({
        ...prev,
        assetUrl: uploaded.publicUrl,
        storagePath: uploaded.storagePath,
        assetType: uploaded.assetType,
        uploadedMimeType: uploaded.mimeType,
        aiExtraction: null,
        aiReviewed: false,
      }));
      setFeedback({
        kind: 'ok',
        text: 'Original certificate file uploaded to Supabase Storage. You can now run AI analysis or enter metadata manually.',
      });
    } catch (err) {
      setFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!form.storagePath) {
      setFeedback({
        kind: 'err',
        text: 'Upload a PNG, JPG, JPEG, or PDF certificate to Supabase Storage first.',
      });
      return;
    }

    setAnalyzing(true);
    setFeedback(null);
    try {
      const mime =
        form.uploadedMimeType ||
        (form.assetType === 'pdf' ? 'application/pdf' : 'image/jpeg');
      const result = await analyzeCertificateWithAI(form.storagePath, mime);
      const ex = result.extracted;

      setForm((prev) => ({
        ...prev,
        title: ex.title ?? prev.title,
        organization: ex.organization ?? prev.organization,
        recipientName: ex.recipient_name ?? prev.recipientName,
        issueDate: ex.issue_date ?? prev.issueDate,
        year: ex.year ? String(ex.year) : prev.year,
        category: ex.category ?? prev.category,
        credentialId: ex.credential_id ?? prev.credentialId,
        description: ex.description ?? prev.description,
        highlightsText:
          ex.achievement_details.length > 0
            ? ex.achievement_details.join(', ')
            : prev.highlightsText,
        aiExtraction: ex,
        aiReviewed: false,
        status: 'draft', // Never auto-publish AI-extracted info
      }));

      setFeedback({
        kind: 'ok',
        text: `AI analysis complete (${result.model}). Please review all extracted fields carefully before saving or publishing.`,
      });
    } catch (err) {
      setFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'AI analysis failed.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (
    e: FormEvent,
    targetStatus?: CertificateStatus,
  ) => {
    e.preventDefault();
    const statusToSave = targetStatus ?? form.status;

    if (!form.title.trim() || !form.organization.trim() || !form.description.trim()) {
      setFeedback({
        kind: 'err',
        text: 'Title, organization, and description are required.',
      });
      return;
    }
    if (!form.assetUrl.trim()) {
      setFeedback({
        kind: 'err',
        text: 'Please upload a certificate file (PNG, JPG, JPEG, or PDF) first.',
      });
      return;
    }

    const parsedYear = Number.parseInt(form.year, 10) || new Date().getFullYear();
    const highlights = form.highlightsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        title: form.title,
        organization: form.organization,
        recipientName: form.recipientName || null,
        year: parsedYear,
        issueDate: form.issueDate || String(parsedYear),
        validUntil: form.validUntil || null,
        credentialId: form.credentialId || null,
        description: form.description,
        category: form.category,
        assetUrl: form.assetUrl,
        storagePath: form.storagePath,
        assetType: form.assetType,
        highlights,
        aiExtractedJson: form.aiExtraction,
        aiReviewed: form.aiExtraction ? true : form.aiReviewed,
        status: statusToSave,
      };

      if (form.editingId) {
        await updateCertificate(form.editingId, payload);
        setFeedback({ kind: 'ok', text: `Certificate updated (${statusToSave}).` });
      } else {
        await createCertificate(payload);
        setFeedback({ kind: 'ok', text: `Certificate saved (${statusToSave}).` });
      }

      setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Failed to save certificate.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cert: Certificate) => {
    setForm({
      editingId: cert.id,
      title: cert.title,
      organization: cert.organization,
      recipientName: cert.recipientName ?? 'Deepak S',
      issueDate: cert.issueDate,
      year: String(cert.year),
      validUntil: cert.validUntil ?? '',
      credentialId: cert.credentialId ?? '',
      category: cert.category,
      description: cert.description,
      highlightsText: (cert.highlights ?? []).join(', '),
      assetUrl: cert.assetUrl,
      storagePath: cert.storagePath ?? null,
      assetType: cert.assetType,
      uploadedMimeType: cert.assetType === 'pdf' ? 'application/pdf' : 'image/jpeg',
      status: cert.status,
      aiExtraction: cert.aiExtractedJson ?? null,
      aiReviewed: Boolean(cert.aiReviewed),
    });
    setFeedback(null);
  };

  const handleTogglePublish = async (cert: Certificate) => {
    const nextStatus: CertificateStatus =
      cert.status === 'published' ? 'draft' : 'published';
    try {
      await updateCertificate(cert.id, { status: nextStatus });
      await refresh();
    } catch (err) {
      setFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Status update failed.',
      });
    }
  };

  const handleDelete = async (cert: Certificate) => {
    if (!window.confirm(`Delete "${cert.title}"? This removes the record and uploaded storage file.`)) {
      return;
    }
    try {
      await deleteCertificate(cert.id, cert.storagePath);
      if (form.editingId === cert.id) setForm(EMPTY_FORM);
      await refresh();
      setFeedback({ kind: 'ok', text: 'Certificate deleted.' });
    } catch (err) {
      setFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Delete failed.',
      });
    }
  };

  return (
    <div className="admin-two-col">
      {/* Left: Upload + AI Analyzer + Review Editor */}
      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem' }}>
            {form.editingId ? 'Edit Certificate' : 'Add & Analyze Certificate'}
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

        {/* File Upload + AI Analyze */}
        <div
          style={{
            padding: '1rem',
            borderRadius: '14px',
            background: 'rgba(8, 12, 23, 0.7)',
            border: '1px dashed rgba(56, 189, 248, 0.35)',
            marginBottom: '1rem',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
            <label
              className="glass-btn glass-btn-secondary"
              style={{ cursor: uploading ? 'wait' : 'pointer' }}
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? 'Uploading...' : 'Upload PNG / JPG / PDF'}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => void handleFileChange(e.target.files?.[0])}
              />
            </label>

            <button
              type="button"
              onClick={() => void handleAnalyzeWithAI()}
              disabled={!form.storagePath || analyzing}
              className="glass-btn glass-btn-primary"
            >
              {analyzing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Analyzing with OpenAI...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyze with AI
                </>
              )}
            </button>
          </div>

          {form.assetUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <FileText size={14} color="var(--accent-cyan)" />
              <span className="font-mono" style={{ wordBreak: 'break-all' }}>
                {form.assetType.toUpperCase()} ready · {form.storagePath ?? 'external URL'}
              </span>
            </div>
          )}

          {form.aiExtraction && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                fontSize: '0.82rem',
                display: 'grid',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="admin-badge admin-badge-published">
                  AI Confidence: {form.aiExtraction.confidence}
                </span>
                <span className="admin-badge admin-badge-draft">
                  Requires Admin Review Before Publishing
                </span>
              </div>
              {form.aiExtraction.fields_requiring_review.length > 0 && (
                <div style={{ color: '#fde68a' }}>
                  Fields needing review:{' '}
                  <code>{form.aiExtraction.fields_requiring_review.join(', ')}</code>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="admin-form-grid">
          <div>
            <label className="admin-label">Certificate Title *</label>
            <input
              type="text"
              className="glass-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. National Agentic AI Hackathon 2026"
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
                placeholder="e.g. ziro.digital"
              />
            </div>
            <div>
              <label className="admin-label">Recipient Name</label>
              <input
                type="text"
                className="glass-input"
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                placeholder="Deepak S"
              />
            </div>
          </div>

          <div className="admin-row-2">
            <div>
              <label className="admin-label">Issue Date *</label>
              <input
                type="text"
                className="glass-input"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                placeholder="e.g. 31 October 2026"
              />
            </div>
            <div>
              <label className="admin-label">Year *</label>
              <input
                type="number"
                className="glass-input"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-row-2">
            <div>
              <label className="admin-label">Category *</label>
              <select
                className="glass-input"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as CertificateCategory })
                }
              >
                <option value="hackathon">Hackathon</option>
                <option value="membership">Membership</option>
                <option value="certification">Certification</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Credential ID (Optional)</label>
              <input
                type="text"
                className="glass-input"
                value={form.credentialId}
                onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                placeholder="Optional ID"
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Validity / Expiry (Optional)</label>
            <input
              type="text"
              className="glass-input"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              placeholder="e.g. October 2027"
            />
          </div>

          <div>
            <label className="admin-label">Description *</label>
            <textarea
              rows={3}
              className="glass-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Factual summary of the certificate..."
            />
          </div>

          <div>
            <label className="admin-label">Highlights / Achievement Tags (comma-separated)</label>
            <input
              type="text"
              className="glass-input"
              value={form.highlightsText}
              onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
              placeholder="Team TRIFORGE, Rank #132, Score 116/180"
            />
          </div>

          {feedback && (
            <div
              role={feedback.kind === 'err' ? 'alert' : 'status'}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.83rem',
                background:
                  feedback.kind === 'ok'
                    ? 'rgba(34, 211, 238, 0.1)'
                    : 'rgba(248, 113, 113, 0.1)',
                border:
                  feedback.kind === 'ok'
                    ? '1px solid rgba(34, 211, 238, 0.3)'
                    : '1px solid rgba(248, 113, 113, 0.3)',
                color: feedback.kind === 'ok' ? '#a5f3fc' : '#fecaca',
              }}
            >
              {feedback.kind === 'ok' ? (
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => void handleSubmit(e, 'draft')}
              className="glass-btn glass-btn-secondary"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => void handleSubmit(e, 'published')}
              className="glass-btn glass-btn-primary"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {form.editingId ? 'Save & Publish' : 'Publish Certificate'}
            </button>
          </div>
        </form>
      </div>

      {/* Right: Existing Certificates List */}
      <div className="glass-panel" style={{ padding: '1.4rem' }}>
        <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
          Stored Certificates ({items.length})
        </h2>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading certificates...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No certificates stored in Supabase yet. Upload one on the left.
          </div>
        ) : (
          <div className="admin-list">
            {items.map((cert) => (
              <div key={cert.id} className="admin-item-card">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>{cert.title}</div>
                    <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {cert.organization} · {cert.issueDate} · {cert.category}
                    </div>
                  </div>
                  <span
                    className={`admin-badge ${
                      cert.status === 'published'
                        ? 'admin-badge-published'
                        : 'admin-badge-draft'
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {cert.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(cert)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.38rem 0.72rem', fontSize: '0.78rem' }}
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleTogglePublish(cert)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.38rem 0.72rem', fontSize: '0.78rem' }}
                  >
                    {cert.status === 'published' ? (
                      <>
                        <EyeOff size={13} />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={13} />
                        Publish
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(cert)}
                    className="glass-btn glass-btn-secondary"
                    style={{
                      padding: '0.38rem 0.72rem',
                      fontSize: '0.78rem',
                      color: '#fca5a5',
                    }}
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

