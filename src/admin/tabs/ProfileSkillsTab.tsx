import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import {
  createSkillAdmin,
  createTechInterestAdmin,
  deleteEducationAdmin,
  deleteSkillAdmin,
  deleteTechInterestAdmin,
  getAllEducationAdmin,
  getAllSkillsAdmin,
  getAllTechInterestsAdmin,
  getProfileAdmin,
  updateProfileAdmin,
  upsertEducationAdmin,
  upsertSocialLinkAdmin,
} from '@/services/portfolio.service';
import { uploadFileToBucket } from '@/services/storage.service';
import type {
  EducationItem,
  SkillRecord,
  TechInterestItem,
} from '@/types/portfolio.types';

export function ProfileSkillsTab() {
  const [profileId, setProfileId] = useState<string>('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [degree, setDegree] = useState('');
  const [college, setCollege] = useState('');
  const [batch, setBatch] = useState('');
  const [shortRole, setShortRole] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [heroIntro, setHeroIntro] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [learningJourney, setLearningJourney] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [skillKind, setSkillKind] = useState<'skill' | 'currently_learning'>('skill');
  const [skillGroupKey, setSkillGroupKey] = useState('programming');
  const [skillName, setSkillName] = useState('');
  const [skillFocus, setSkillFocus] = useState('');

  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [interests, setInterests] = useState<TechInterestItem[]>([]);
  const [newInterestName, setNewInterestName] = useState('');
  const [newInterestCat, setNewInterestCat] =
    useState<TechInterestItem['category']>('AI & Intelligence');
  const [newInterestDesc, setNewInterestDesc] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ profile }, allSkills, allEdu, allInterests] = await Promise.all([
        getProfileAdmin(),
        getAllSkillsAdmin(),
        getAllEducationAdmin(),
        getAllTechInterestsAdmin(),
      ]);

      setProfileId(profile.id ?? '');
      setName(profile.name);
      setDisplayName(profile.displayName);
      setDegree(profile.degree);
      setCollege(profile.college);
      setBatch(profile.batch);
      setShortRole(profile.shortRole);
      setProfessionalTitle(profile.professionalTitle);
      setHeroIntro(profile.heroIntro);
      setAboutText(profile.aboutParagraphs.join('\n\n'));
      setLearningJourney(profile.learningJourney);
      setContactEmail(profile.emailPlaceholder);
      setProfileImageUrl(profile.isProfileImagePlaceholder ? null : profile.profileImageUrl);
      setProfileImagePath(profile.profileImagePath ?? null);
      setGithubUrl(profile.githubUrl);
      setLinkedinUrl(profile.linkedinUrl ?? '');

      setSkills(allSkills);
      setEducationList(allEdu);
      setInterests(allInterests);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handlePhotoUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingPhoto(true);
    setStatusMsg(null);
    try {
      const uploaded = await uploadFileToBucket('portfolio-profile', file, 'profile');
      setProfileImageUrl(uploaded.publicUrl);
      setProfileImagePath(uploaded.storagePath);
      setStatusMsg('Profile image uploaded. Click Save Profile to publish.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setSavingProfile(true);
    setStatusMsg(null);
    try {
      await updateProfileAdmin(profileId, {
        name,
        displayName,
        degree,
        college,
        batch,
        shortRole,
        professionalTitle,
        heroIntro,
        aboutParagraphs: aboutText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
        learningJourney,
        contactEmail,
        profileImageUrl,
        profileImagePath,
      });

      await Promise.all([
        upsertSocialLinkAdmin({
          profileId,
          platform: 'github',
          label: 'GitHub',
          url: githubUrl || null,
          sortOrder: 1,
        }),
        upsertSocialLinkAdmin({
          profileId,
          platform: 'linkedin',
          label: 'LinkedIn',
          url: linkedinUrl || null,
          placeholderNote: linkedinUrl
            ? null
            : 'LinkedIn profile URL placeholder — update in Admin Dashboard when available.',
          sortOrder: 2,
        }),
      ]);

      setStatusMsg('Profile and social links updated.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = async (e: FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    const groupMeta: Record<string, { title: string; subtitle: string; accent: 'cyan' | 'blue' | 'violet' }> = {
      programming: { title: 'Programming', subtitle: 'Core languages for problem-solving and system logic', accent: 'cyan' },
      frontend: { title: 'Frontend', subtitle: 'Interfaces, responsive layouts, and interactive components', accent: 'blue' },
      tools: { title: 'Tools', subtitle: 'Development environments, version control, and prototyping', accent: 'violet' },
      ai: { title: 'AI', subtitle: 'Applied intelligence, prompting, and foundational concepts', accent: 'cyan' },
      learning: { title: 'Currently Learning', subtitle: 'Active areas of technical growth', accent: 'violet' },
    };
    const key = skillKind === 'currently_learning' ? 'learning' : skillGroupKey;
    const meta = groupMeta[key] ?? groupMeta.programming;

    await createSkillAdmin({
      kind: skillKind,
      groupKey: key,
      groupTitle: meta.title,
      groupSubtitle: meta.subtitle,
      accent: meta.accent,
      name: skillName,
      focusNote: skillKind === 'currently_learning' ? skillFocus : null,
      sortOrder: skills.length + 1,
      isPublished: true,
    });
    setSkillName('');
    setSkillFocus('');
    await loadAll();
  };

  const handleAddInterest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newInterestName.trim() || !newInterestDesc.trim()) return;
    await createTechInterestAdmin({
      name: newInterestName,
      category: newInterestCat,
      description: newInterestDesc,
      explorationNote: 'Active Exploration Area',
    });
    setNewInterestName('');
    setNewInterestDesc('');
    await loadAll();
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading profile & skills...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '1.35rem' }}>
      <div className="admin-two-col">
        {/* Profile & Social Links */}
        <div className="glass-panel" style={{ padding: '1.4rem' }}>
          <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
            Profile, About Me & Social Links
          </h2>
          <form onSubmit={(e) => void handleSaveProfile(e)} className="admin-form-grid">
            <div className="admin-row-2">
              <div>
                <label className="admin-label">Full Name</label>
                <input className="glass-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Display Name</label>
                <input className="glass-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
            </div>

            <div className="admin-row-2">
              <div>
                <label className="admin-label">Degree</label>
                <input className="glass-input" value={degree} onChange={(e) => setDegree(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Batch</label>
                <input className="glass-input" value={batch} onChange={(e) => setBatch(e.target.value)} />
              </div>
            </div>

            <div className="admin-row-2">
              <div>
                <label className="admin-label">College</label>
                <input className="glass-input" value={college} onChange={(e) => setCollege(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Short Role</label>
                <input className="glass-input" value={shortRole} onChange={(e) => setShortRole(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="admin-label">Professional Title</label>
              <input className="glass-input" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} />
            </div>

            <div>
              <label className="admin-label">Hero Introduction</label>
              <textarea rows={2} className="glass-input" value={heroIntro} onChange={(e) => setHeroIntro(e.target.value)} />
            </div>

            <div>
              <label className="admin-label">About Me Paragraphs (blank line between paragraphs)</label>
              <textarea rows={4} className="glass-input" value={aboutText} onChange={(e) => setAboutText(e.target.value)} />
            </div>

            <div>
              <label className="admin-label">Learning Journey</label>
              <textarea rows={2} className="glass-input" value={learningJourney} onChange={(e) => setLearningJourney(e.target.value)} />
            </div>

            <div className="admin-row-2">
              <div>
                <label className="admin-label">GitHub URL</label>
                <input className="glass-input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">LinkedIn URL</label>
                <input
                  className="glass-input"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Contact Email</label>
              <input
                type="email"
                className="glass-input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
              <label className="glass-btn glass-btn-secondary" style={{ cursor: 'pointer' }}>
                {uploadingPhoto ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                Upload Profile Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => void handlePhotoUpload(e.target.files?.[0])}
                />
              </label>
              {profileImageUrl && (
                <span className="font-mono" style={{ fontSize: '0.73rem', color: 'var(--accent-cyan)' }}>
                  Custom photo linked
                </span>
              )}
            </div>

            {statusMsg && (
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                {statusMsg}
              </div>
            )}

            <button type="submit" disabled={savingProfile} className="glass-btn glass-btn-primary">
              <Save size={15} />
              {savingProfile ? 'Saving...' : 'Save Profile & Links'}
            </button>
          </form>
        </div>

        {/* Skills & Currently Learning + Education + Tech Interests */}
        <div style={{ display: 'grid', gap: '1.35rem' }}>
          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
              Skills & Currently Learning ({skills.length})
            </h2>

            <form onSubmit={(e) => void handleAddSkill(e)} className="admin-form-grid" style={{ marginBottom: '1rem' }}>
              <div className="admin-row-2">
                <div>
                  <label className="admin-label">Type</label>
                  <select
                    className="glass-input"
                    value={skillKind}
                    onChange={(e) =>
                      setSkillKind(e.target.value as 'skill' | 'currently_learning')
                    }
                  >
                    <option value="skill">Core Skill</option>
                    <option value="currently_learning">Currently Learning</option>
                  </select>
                </div>

                {skillKind === 'skill' && (
                  <div>
                    <label className="admin-label">Category</label>
                    <select
                      className="glass-input"
                      value={skillGroupKey}
                      onChange={(e) => setSkillGroupKey(e.target.value)}
                    >
                      <option value="programming">Programming</option>
                      <option value="frontend">Frontend</option>
                      <option value="tools">Tools</option>
                      <option value="ai">AI</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="admin-label">Skill / Topic Name</label>
                <input
                  className="glass-input"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. TypeScript"
                />
              </div>

              {skillKind === 'currently_learning' && (
                <div>
                  <label className="admin-label">Focus Note</label>
                  <input
                    className="glass-input"
                    value={skillFocus}
                    onChange={(e) => setSkillFocus(e.target.value)}
                    placeholder="What are you focusing on?"
                  />
                </div>
              )}

              <button type="submit" className="glass-btn glass-btn-secondary">
                <Plus size={15} />
                Add Skill
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {skills.map((s) => (
                <span key={s.id} className="glass-pill font-mono">
                  <span>
                    [{s.groupTitle}] {s.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => void deleteSkillAdmin(s.id).then(loadAll)}
                    aria-label={`Remove ${s.name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
              Education ({educationList.length})
            </h2>
            <div className="admin-list">
              {educationList.map((edu) => (
                <div key={edu.id} className="admin-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {edu.institution} · {edu.period} ({edu.status})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void upsertEducationAdmin({
                          id: edu.id,
                          degree: edu.degree,
                          institution: edu.institution,
                          period: edu.period,
                          status: edu.status,
                          focusAreas: edu.focusAreas,
                          description: edu.description,
                          isPublished: !(edu.isPublished ?? true),
                        }).then(loadAll)
                      }
                      className="glass-btn glass-btn-secondary"
                      style={{ padding: '0.32rem 0.65rem', fontSize: '0.74rem' }}
                    >
                      {edu.isPublished ? 'Published' : 'Hidden'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteEducationAdmin(edu.id).then(loadAll)}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#fca5a5', alignSelf: 'flex-start' }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
              Technology Interests ({interests.length})
            </h2>
            <form onSubmit={(e) => void handleAddInterest(e)} className="admin-form-grid" style={{ marginBottom: '1rem' }}>
              <div className="admin-row-2">
                <input
                  className="glass-input"
                  value={newInterestName}
                  onChange={(e) => setNewInterestName(e.target.value)}
                  placeholder="Interest name"
                />
                <select
                  className="glass-input"
                  value={newInterestCat}
                  onChange={(e) =>
                    setNewInterestCat(e.target.value as TechInterestItem['category'])
                  }
                >
                  <option value="AI & Intelligence">AI & Intelligence</option>
                  <option value="IoT & Microcontrollers">IoT & Microcontrollers</option>
                  <option value="Robotics & Hardware">Robotics & Hardware</option>
                </select>
              </div>
              <input
                className="glass-input"
                value={newInterestDesc}
                onChange={(e) => setNewInterestDesc(e.target.value)}
                placeholder="Short exploration description..."
              />
              <button type="submit" className="glass-btn glass-btn-secondary">
                <Plus size={15} />
                Add Tech Interest
              </button>
            </form>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {interests.map((item) => (
                <span key={item.id} className="glass-pill font-mono">
                  {item.name}
                  <button
                    type="button"
                    onClick={() => void deleteTechInterestAdmin(item.id).then(loadAll)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

