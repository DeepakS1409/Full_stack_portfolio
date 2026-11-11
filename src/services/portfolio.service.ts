import { achievementsData } from '@/data/achievements.data';
import { educationData } from '@/data/education.data';
import { profileData } from '@/data/profile.data';
import { projectsData } from '@/data/projects.data';
import { currentlyLearningItems, skillGroups } from '@/data/skills.data';
import { techInterestsData } from '@/data/techInterests.data';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { deleteStorageObject } from '@/services/storage.service';
import type {
  AchievementItem,
  EducationItem,
  ProfileData,
  ProjectItem,
  SkillGroup,
  SkillRecord,
  SocialLinkItem,
  TechInterestItem,
} from '@/types/portfolio.types';

const DEFAULT_PROJECT_IMAGES_BY_SLUG = new Map(
  projectsData.map((project) => [project.id, project.imageUrl]),
);

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `item-${Date.now()}`
  );
}

// ---------------------------------------------------------------------------
// Profile & Social Links
// ---------------------------------------------------------------------------
interface ProfileRow {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  degree: string;
  college: string;
  batch: string;
  short_role: string;
  professional_title: string;
  hero_intro: string;
  about_paragraphs: unknown;
  learning_journey: string;
  contact_email: string;
  profile_image_path: string | null;
  profile_image_url: string | null;
}

interface SocialLinkRow {
  id: string;
  profile_id: string;
  platform: string;
  label: string;
  url: string | null;
  placeholder_note: string | null;
  sort_order: number;
  is_published: boolean;
}

export async function getProfile(): Promise<ProfileData> {
  if (!isSupabaseConfigured) {
    return profileData;
  }

  const supabase = getSupabaseClient();
  const { data: row, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', 'primary')
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!row) {
    return profileData;
  }

  const typed = row as ProfileRow;
  const { data: socialRows } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', typed.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const links = (socialRows ?? []) as SocialLinkRow[];
  const github = links.find((l) => l.platform === 'github');
  const linkedin = links.find((l) => l.platform === 'linkedin');

  return {
    id: typed.id,
    name: typed.name,
    displayName: typed.display_name,
    degree: typed.degree,
    college: typed.college,
    batch: typed.batch,
    shortRole: typed.short_role,
    professionalTitle: typed.professional_title,
    heroIntro: typed.hero_intro,
    aboutParagraphs: toStringArray(typed.about_paragraphs),
    learningJourney: typed.learning_journey,
    emailPlaceholder: typed.contact_email || profileData.emailPlaceholder,
    githubUrl: github?.url || profileData.githubUrl,
    linkedinUrl: linkedin?.url ?? null,
    linkedinPlaceholderNote:
      linkedin?.placeholder_note ?? profileData.linkedinPlaceholderNote,
    profileImageUrl: typed.profile_image_url || profileData.profileImageUrl,
    profileImagePath: typed.profile_image_path,
    isProfileImagePlaceholder: typed.profile_image_url ? false : profileData.isProfileImagePlaceholder,
  };
}

export async function getProfileAdmin(): Promise<{
  profile: ProfileData;
  socialLinks: SocialLinkItem[];
}> {
  const supabase = getSupabaseClient();
  const { data: row, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', 'primary')
    .maybeSingle();

  if (error || !row) {
    throw new Error(`Failed to load admin profile: ${error?.message ?? 'Not found'}`);
  }

  const typed = row as ProfileRow;
  const { data: socialRows, error: socialError } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', typed.id)
    .order('sort_order', { ascending: true });

  if (socialError) {
    throw new Error(`Failed to load social links: ${socialError.message}`);
  }

  const links = ((socialRows ?? []) as SocialLinkRow[]).map((l) => ({
    id: l.id,
    profileId: l.profile_id,
    platform: l.platform,
    label: l.label,
    url: l.url,
    placeholderNote: l.placeholder_note,
    sortOrder: l.sort_order,
    isPublished: l.is_published,
  }));

  const github = links.find((l) => l.platform === 'github');
  const linkedin = links.find((l) => l.platform === 'linkedin');

  return {
    profile: {
      id: typed.id,
      name: typed.name,
      displayName: typed.display_name,
      degree: typed.degree,
      college: typed.college,
      batch: typed.batch,
      shortRole: typed.short_role,
      professionalTitle: typed.professional_title,
      heroIntro: typed.hero_intro,
      aboutParagraphs: toStringArray(typed.about_paragraphs),
      learningJourney: typed.learning_journey,
      emailPlaceholder: typed.contact_email,
      githubUrl: github?.url ?? profileData.githubUrl,
      linkedinUrl: linkedin?.url ?? null,
      linkedinPlaceholderNote:
        linkedin?.placeholderNote ?? profileData.linkedinPlaceholderNote,
      profileImageUrl: typed.profile_image_url || profileData.profileImageUrl,
      profileImagePath: typed.profile_image_path,
      isProfileImagePlaceholder: typed.profile_image_url ? false : profileData.isProfileImagePlaceholder,
    },
    socialLinks: links,
  };
}

export async function updateProfileAdmin(
  id: string,
  input: {
    name: string;
    displayName: string;
    degree: string;
    college: string;
    batch: string;
    shortRole: string;
    professionalTitle: string;
    heroIntro: string;
    aboutParagraphs: string[];
    learningJourney: string;
    contactEmail: string;
    profileImageUrl?: string | null;
    profileImagePath?: string | null;
  },
): Promise<void> {
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = {
    name: input.name.trim(),
    display_name: input.displayName.trim(),
    degree: input.degree.trim(),
    college: input.college.trim(),
    batch: input.batch.trim(),
    short_role: input.shortRole.trim(),
    professional_title: input.professionalTitle.trim(),
    hero_intro: input.heroIntro.trim(),
    about_paragraphs: input.aboutParagraphs,
    learning_journey: input.learningJourney.trim(),
    contact_email: input.contactEmail.trim(),
  };

  if (input.profileImageUrl !== undefined) {
    patch.profile_image_url = input.profileImageUrl;
  }
  if (input.profileImagePath !== undefined) {
    patch.profile_image_path = input.profileImagePath;
  }

  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function upsertSocialLinkAdmin(input: {
  profileId: string;
  platform: string;
  label: string;
  url: string | null;
  placeholderNote?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('social_links').upsert(
    {
      profile_id: input.profileId,
      platform: input.platform.trim().toLowerCase(),
      label: input.label.trim(),
      url: input.url?.trim() || null,
      placeholder_note: input.placeholderNote?.trim() || null,
      sort_order: input.sortOrder ?? 0,
      is_published: input.isPublished ?? true,
    },
    { onConflict: 'profile_id,platform' },
  );

  if (error) {
    throw new Error(`Failed to save social link: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Skills & Currently Learning
// ---------------------------------------------------------------------------
interface SkillRow {
  id: string;
  kind: 'skill' | 'currently_learning';
  group_key: string;
  group_title: string;
  group_subtitle: string;
  accent: 'cyan' | 'blue' | 'violet';
  name: string;
  focus_note: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface SkillsBundle {
  groups: SkillGroup[];
  currentlyLearning: { name: string; focus: string }[];
}

export async function getSkills(): Promise<SkillsBundle> {
  if (!isSupabaseConfigured) {
    return {
      groups: skillGroups,
      currentlyLearning: currentlyLearningItems,
    };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch skills: ${error.message}`);
  }

  const rows = (data ?? []) as SkillRow[];
  const groupsMap = new Map<string, SkillGroup>();
  const learning: { name: string; focus: string }[] = [];

  for (const row of rows) {
    if (row.kind === 'currently_learning') {
      learning.push({
        name: row.name,
        focus: row.focus_note ?? '',
      });
      continue;
    }

    const existing = groupsMap.get(row.group_key);
    if (existing) {
      existing.items.push(row.name);
    } else {
      groupsMap.set(row.group_key, {
        id: row.group_key,
        title: row.group_title,
        subtitle: row.group_subtitle,
        accent: row.accent,
        items: [row.name],
      });
    }
  }

  return {
    groups: Array.from(groupsMap.values()),
    currentlyLearning: learning,
  };
}

export async function getAllSkillsAdmin(): Promise<SkillRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to load skills: ${error.message}`);
  }

  return ((data ?? []) as SkillRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    groupKey: row.group_key,
    groupTitle: row.group_title,
    groupSubtitle: row.group_subtitle,
    accent: row.accent,
    name: row.name,
    focusNote: row.focus_note,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  }));
}

export async function createSkillAdmin(
  input: Omit<SkillRecord, 'id'>,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('skills').insert({
    kind: input.kind,
    group_key: input.groupKey.trim().toLowerCase(),
    group_title: input.groupTitle.trim(),
    group_subtitle: input.groupSubtitle.trim(),
    accent: input.accent,
    name: input.name.trim(),
    focus_note: input.focusNote?.trim() || null,
    sort_order: input.sortOrder,
    is_published: input.isPublished,
  });

  if (error) {
    throw new Error(`Failed to create skill: ${error.message}`);
  }
}

export async function updateSkillAdmin(
  id: string,
  input: Partial<Omit<SkillRecord, 'id'>>,
): Promise<void> {
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = {};
  if (input.kind !== undefined) patch.kind = input.kind;
  if (input.groupKey !== undefined) patch.group_key = input.groupKey.trim().toLowerCase();
  if (input.groupTitle !== undefined) patch.group_title = input.groupTitle.trim();
  if (input.groupSubtitle !== undefined) patch.group_subtitle = input.groupSubtitle.trim();
  if (input.accent !== undefined) patch.accent = input.accent;
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.focusNote !== undefined) patch.focus_note = input.focusNote?.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isPublished !== undefined) patch.is_published = input.isPublished;

  const { error } = await supabase.from('skills').update(patch).eq('id', id);
  if (error) {
    throw new Error(`Failed to update skill: ${error.message}`);
  }
}

export async function deleteSkillAdmin(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete skill: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  category: string;
  status_label: string;
  technologies: unknown;
  highlights: unknown;
  image_url: string | null;
  storage_path: string | null;
  github_url: string | null;
  live_url: string | null;
  sort_order: number;
  is_published: boolean;
}

function mapProjectRow(row: ProjectRow): ProjectItem {
  const fallbackImage = DEFAULT_PROJECT_IMAGES_BY_SLUG.get(row.slug) ?? projectsData[0].imageUrl;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    details: row.details || row.description,
    category: row.category,
    statusLabel: row.status_label,
    technologies: toStringArray(row.technologies),
    highlights: toStringArray(row.highlights),
    imageUrl: row.image_url || fallbackImage,
    storagePath: row.storage_path,
    isPlaceholderImage: !row.image_url,
    githubUrl: row.github_url,
    liveUrl: row.live_url,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

export async function getProjects(): Promise<ProjectItem[]> {
  if (!isSupabaseConfigured) {
    return projectsData;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return ((data ?? []) as ProjectRow[]).map(mapProjectRow);
}

export async function getAllProjectsAdmin(): Promise<ProjectItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin projects: ${error.message}`);
  }

  return ((data ?? []) as ProjectRow[]).map(mapProjectRow);
}

export async function createProjectAdmin(input: {
  name: string;
  tagline: string;
  description: string;
  details: string;
  category: string;
  statusLabel: string;
  technologies: string[];
  highlights: string[];
  imageUrl?: string | null;
  storagePath?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}): Promise<ProjectItem> {
  const supabase = getSupabaseClient();
  const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug,
      name: input.name.trim(),
      tagline: input.tagline.trim(),
      description: input.description.trim(),
      details: input.details.trim(),
      category: input.category.trim(),
      status_label: input.statusLabel.trim(),
      technologies: input.technologies,
      highlights: input.highlights,
      image_url: input.imageUrl?.trim() || null,
      storage_path: input.storagePath ?? null,
      github_url: input.githubUrl?.trim() || null,
      live_url: input.liveUrl?.trim() || null,
      sort_order: input.sortOrder ?? 0,
      is_published: input.isPublished ?? true,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create project: ${error?.message ?? 'Unknown error'}`);
  }

  return mapProjectRow(data as ProjectRow);
}

export async function updateProjectAdmin(
  id: string,
  input: Partial<{
    name: string;
    tagline: string;
    description: string;
    details: string;
    category: string;
    statusLabel: string;
    technologies: string[];
    highlights: string[];
    imageUrl: string | null;
    storagePath: string | null;
    githubUrl: string | null;
    liveUrl: string | null;
    sortOrder: number;
    isPublished: boolean;
  }>,
): Promise<ProjectItem> {
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.tagline !== undefined) patch.tagline = input.tagline.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.details !== undefined) patch.details = input.details.trim();
  if (input.category !== undefined) patch.category = input.category.trim();
  if (input.statusLabel !== undefined) patch.status_label = input.statusLabel.trim();
  if (input.technologies !== undefined) patch.technologies = input.technologies;
  if (input.highlights !== undefined) patch.highlights = input.highlights;
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl?.trim() || null;
  if (input.storagePath !== undefined) patch.storage_path = input.storagePath;
  if (input.githubUrl !== undefined) patch.github_url = input.githubUrl?.trim() || null;
  if (input.liveUrl !== undefined) patch.live_url = input.liveUrl?.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isPublished !== undefined) patch.is_published = input.isPublished;

  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update project: ${error?.message ?? 'Unknown error'}`);
  }

  return mapProjectRow(data as ProjectRow);
}

export async function deleteProjectAdmin(
  id: string,
  storagePath?: string | null,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
  if (storagePath) {
    await deleteStorageObject('portfolio-projects', storagePath);
  }
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------
interface AchievementRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  organization: string;
  achieved_date: string;
  badge_text: string;
  description: string;
  accent: 'cyan' | 'blue' | 'violet';
  image_url: string | null;
  storage_path: string | null;
  sort_order: number;
  is_published: boolean;
}

function mapAchievementRow(row: AchievementRow): AchievementItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    organization: row.organization,
    year: row.achieved_date,
    badgeText: row.badge_text,
    description: row.description,
    accent: row.accent,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

export async function getAchievements(): Promise<AchievementItem[]> {
  if (!isSupabaseConfigured) {
    return achievementsData;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch achievements: ${error.message}`);
  }

  return ((data ?? []) as AchievementRow[]).map(mapAchievementRow);
}

export async function getAllAchievementsAdmin(): Promise<AchievementItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load admin achievements: ${error.message}`);
  }

  return ((data ?? []) as AchievementRow[]).map(mapAchievementRow);
}

export async function createAchievementAdmin(input: {
  title: string;
  subtitle: string;
  organization: string;
  year: string;
  badgeText: string;
  description: string;
  accent: 'cyan' | 'blue' | 'violet';
  imageUrl?: string | null;
  storagePath?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}): Promise<AchievementItem> {
  const supabase = getSupabaseClient();
  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      slug,
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      organization: input.organization.trim(),
      achieved_date: input.year.trim(),
      badge_text: input.badgeText.trim(),
      description: input.description.trim(),
      accent: input.accent,
      image_url: input.imageUrl?.trim() || null,
      storage_path: input.storagePath ?? null,
      sort_order: input.sortOrder ?? 0,
      is_published: input.isPublished ?? true,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create achievement: ${error?.message ?? 'Unknown error'}`);
  }

  return mapAchievementRow(data as AchievementRow);
}

export async function updateAchievementAdmin(
  id: string,
  input: Partial<{
    title: string;
    subtitle: string;
    organization: string;
    year: string;
    badgeText: string;
    description: string;
    accent: 'cyan' | 'blue' | 'violet';
    imageUrl: string | null;
    storagePath: string | null;
    sortOrder: number;
    isPublished: boolean;
  }>,
): Promise<AchievementItem> {
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle.trim();
  if (input.organization !== undefined) patch.organization = input.organization.trim();
  if (input.year !== undefined) patch.achieved_date = input.year.trim();
  if (input.badgeText !== undefined) patch.badge_text = input.badgeText.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.accent !== undefined) patch.accent = input.accent;
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl?.trim() || null;
  if (input.storagePath !== undefined) patch.storage_path = input.storagePath;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isPublished !== undefined) patch.is_published = input.isPublished;

  const { data, error } = await supabase
    .from('achievements')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update achievement: ${error?.message ?? 'Unknown error'}`);
  }

  return mapAchievementRow(data as AchievementRow);
}

export async function deleteAchievementAdmin(
  id: string,
  storagePath?: string | null,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('achievements').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete achievement: ${error.message}`);
  }
  if (storagePath) {
    await deleteStorageObject('portfolio-achievements', storagePath);
  }
}

// ---------------------------------------------------------------------------
// Education & Tech Interests
// ---------------------------------------------------------------------------
interface EducationRow {
  id: string;
  slug: string;
  degree: string;
  institution: string;
  period: string;
  status_label: string;
  focus_areas: unknown;
  description: string;
  sort_order: number;
  is_published: boolean;
}

export async function getEducation(): Promise<EducationItem[]> {
  if (!isSupabaseConfigured) {
    return educationData;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch education: ${error.message}`);
  }

  return ((data ?? []) as EducationRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    degree: row.degree,
    institution: row.institution,
    period: row.period,
    status: row.status_label,
    focusAreas: toStringArray(row.focus_areas),
    description: row.description,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  }));
}

export async function getAllEducationAdmin(): Promise<EducationItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to load education: ${error.message}`);
  }

  return ((data ?? []) as EducationRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    degree: row.degree,
    institution: row.institution,
    period: row.period,
    status: row.status_label,
    focusAreas: toStringArray(row.focus_areas),
    description: row.description,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  }));
}

export async function upsertEducationAdmin(input: {
  id?: string;
  degree: string;
  institution: string;
  period: string;
  status: string;
  focusAreas: string[];
  description: string;
  isPublished?: boolean;
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (input.id) {
    const { error } = await supabase
      .from('education')
      .update({
        degree: input.degree.trim(),
        institution: input.institution.trim(),
        period: input.period.trim(),
        status_label: input.status.trim(),
        focus_areas: input.focusAreas,
        description: input.description.trim(),
        is_published: input.isPublished ?? true,
      })
      .eq('id', input.id);
    if (error) throw new Error(`Failed to update education: ${error.message}`);
    return;
  }

  const { error } = await supabase.from('education').insert({
    slug: `${slugify(input.degree)}-${Math.random().toString(36).slice(2, 6)}`,
    degree: input.degree.trim(),
    institution: input.institution.trim(),
    period: input.period.trim(),
    status_label: input.status.trim(),
    focus_areas: input.focusAreas,
    description: input.description.trim(),
    is_published: input.isPublished ?? true,
  });
  if (error) throw new Error(`Failed to create education: ${error.message}`);
}

export async function deleteEducationAdmin(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('education').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete education: ${error.message}`);
}

interface TechInterestRow {
  id: string;
  slug: string;
  name: string;
  category: TechInterestItem['category'];
  description: string;
  exploration_note: string;
  sort_order: number;
  is_published: boolean;
}

export async function getTechInterests(): Promise<TechInterestItem[]> {
  if (!isSupabaseConfigured) {
    return techInterestsData;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tech_interests')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tech interests: ${error.message}`);
  }

  return ((data ?? []) as TechInterestRow[]).map((row) => ({
    id: row.slug || row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    explorationNote: row.exploration_note,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  }));
}

export async function getAllTechInterestsAdmin(): Promise<TechInterestItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tech_interests')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to load tech interests: ${error.message}`);
  }

  return ((data ?? []) as TechInterestRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    explorationNote: row.exploration_note,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  }));
}

export async function createTechInterestAdmin(input: {
  name: string;
  category: TechInterestItem['category'];
  description: string;
  explorationNote: string;
  isPublished?: boolean;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('tech_interests').insert({
    slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    category: input.category,
    description: input.description.trim(),
    exploration_note: input.explorationNote.trim(),
    is_published: input.isPublished ?? true,
  });
  if (error) throw new Error(`Failed to create tech interest: ${error.message}`);
}

export async function deleteTechInterestAdmin(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('tech_interests').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete tech interest: ${error.message}`);
}

/**
 * Unified portfolio service facade preserving synchronous initial defaults
 * alongside live Supabase async queries.
 */
export const portfolioService = {
  getFallbackProfile: () => profileData,
  getFallbackSkills: () => ({
    groups: skillGroups,
    currentlyLearning: currentlyLearningItems,
  }),
  getFallbackProjects: () => projectsData,
  getFallbackAchievements: () => achievementsData,
  getFallbackEducation: () => educationData,
  getFallbackTechInterests: () => techInterestsData,
  getProfile,
  getSkills,
  getProjects,
  getAchievements,
  getEducation,
  getTechInterests,
};
