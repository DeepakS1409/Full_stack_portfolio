import { useState, type FormEvent } from 'react';
import { AlertTriangle, ExternalLink, Github, Info, Linkedin, Mail, Send } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { portfolioService } from '@/services/portfolio.service';
import './sections.css';

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactSection() {
  const profile = portfolioService.getProfile();

  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  const validate = (form: ContactFormValues): ContactFormErrors => {
    const nextErrors: ContactFormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = 'Please enter your name (at least 2 characters).';
    }
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!form.subject.trim() || form.subject.trim().length < 3) {
      nextErrors.subject = 'Please enter a short subject.';
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = 'Please enter a message of at least 10 characters.';
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitNotice(null);
      return;
    }

    const mailtoSubject = encodeURIComponent(`[Portfolio] ${values.subject.trim()}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${values.name.trim()}\nEmail: ${values.email.trim()}\n\n${values.message.trim()}`,
    );
    const mailtoHref = `mailto:${profile.emailPlaceholder}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setSubmitNotice(
      'Direct backend form delivery is not configured in this frontend-only phase. Opening your default mail client via mailto fallback.',
    );

    window.location.href = mailtoHref;
  };

  return (
    <section id="contact" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="09 · Contact"
          title="Connect & Collaborate"
          subtitle="Reach out regarding software development, AI concepts, or academic collaboration."
        />

        <div className="contact-grid">
          {/* Left Info Card */}
          <GlassCard accent="blue" style={{ padding: '1.6rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3
                  className="font-display"
                  style={{ margin: '0 0 0.45rem', fontSize: '1.2rem', fontWeight: 600 }}
                >
                  Profiles & Direct Channels
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                  }}
                >
                  Frontend phase active. Once backend APIs are connected later, this form can route directly to a server endpoint.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-btn glass-btn-secondary"
                  style={{ justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Github size={17} color="var(--accent-cyan)" />
                    GitHub (@DeepakS1409)
                  </span>
                  <ExternalLink size={15} color="var(--text-muted)" />
                </a>

                {profile.linkedinUrl ? (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn glass-btn-secondary"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Linkedin size={17} color="var(--accent-blue)" />
                      LinkedIn Profile
                    </span>
                    <ExternalLink size={15} color="var(--text-muted)" />
                  </a>
                ) : (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(15, 23, 42, 0.56)',
                      border: '1px dashed rgba(148, 163, 184, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Linkedin size={16} color="var(--accent-blue)" />
                      LinkedIn (Placeholder)
                    </div>
                    <span
                      className="font-mono"
                      style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}
                    >
                      {profile.linkedinPlaceholderNote}
                    </span>
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(34, 211, 238, 0.06)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  fontSize: '0.84rem',
                  color: '#cbd5e1',
                }}
              >
                <Info size={17} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Backend submission is intentionally not configured yet. Submitting validates your input and prepares a{' '}
                  <code>mailto:</code> draft instead of faking delivery.
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Right Form Card */}
          <GlassCard accent="violet" style={{ padding: '1.6rem' }}>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '1rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                    placeholder="Your name"
                    className="glass-input"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && (
                    <span style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.78rem', color: '#fca5a5' }}>
                      {errors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                    placeholder="you@example.com"
                    className="glass-input"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <span style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.78rem', color: '#fca5a5' }}>
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={values.subject}
                  onChange={(e) => setValues({ ...values, subject: e.target.value })}
                  placeholder="Project inquiry, collaboration, or feedback"
                  className="glass-input"
                  aria-invalid={Boolean(errors.subject)}
                />
                {errors.subject && (
                  <span style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.78rem', color: '#fca5a5' }}>
                    {errors.subject}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={values.message}
                  onChange={(e) => setValues({ ...values, message: e.target.value })}
                  placeholder="Write your message here..."
                  className="glass-input"
                  style={{ resize: 'vertical', minHeight: '112px' }}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && (
                  <span style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.78rem', color: '#fca5a5' }}>
                    {errors.message}
                  </span>
                )}
              </div>

              {submitNotice && (
                <div
                  role="status"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.55rem',
                    padding: '0.8rem 0.95rem',
                    borderRadius: '10px',
                    background: 'rgba(251, 191, 36, 0.08)',
                    border: '1px solid rgba(251, 191, 36, 0.28)',
                    fontSize: '0.84rem',
                    color: '#fde68a',
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{submitNotice}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  paddingTop: '0.3rem',
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Mail size={13} />
                  Mailto fallback mode
                </span>

                <button type="submit" className="glass-btn glass-btn-primary">
                  <Send size={15} />
                  Compose via Email Client
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

