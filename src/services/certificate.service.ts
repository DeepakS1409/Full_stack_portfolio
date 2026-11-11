import { certificatesData } from '@/data/certificates.data';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { deleteStorageObject } from '@/services/storage.service';
import type {
  Certificate,
  CertificateAdapterResponse,
  CertificateAssetType,
  CertificateCategory,
  CertificateExtractionResult,
  CertificateQueryOptions,
  CertificateStatus,
  CertificateUpsertInput,
  ICertificateAdapter,
} from '@/types/certificate.types';

interface CertificateRow {
  id: string;
  slug: string | null;
  title: string;
  organization: string;
  recipient_name: string | null;
  year: number;
  issue_date: string;
  valid_until: string | null;
  credential_id: string | null;
  description: string;
  category: CertificateCategory;
  asset_url: string;
  storage_path: string | null;
  asset_type: CertificateAssetType;
  thumbnail_url: string | null;
  highlights: unknown;
  ai_extracted_json: CertificateExtractionResult | null;
  ai_reviewed: boolean;
  status: CertificateStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapCertificateRow(row: CertificateRow): Certificate {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    organization: row.organization,
    recipientName: row.recipient_name,
    year: row.year,
    issueDate: row.issue_date,
    validUntil: row.valid_until,
    credentialId: row.credential_id,
    description: row.description,
    category: row.category,
    assetUrl: row.asset_url,
    storagePath: row.storage_path,
    assetType: row.asset_type,
    thumbnailUrl: row.thumbnail_url,
    isPlaceholderAsset: false,
    highlights: Array.isArray(row.highlights)
      ? row.highlights.filter((item): item is string => typeof item === 'string')
      : [],
    aiExtractedJson: row.ai_extracted_json,
    aiReviewed: row.ai_reviewed,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Local in-memory adapter backed by `src/data/certificates.data.ts`.
 * Used automatically when Supabase env vars are not configured yet.
 */
export class LocalCertificateAdapter implements ICertificateAdapter {
  public readonly sourceName = 'local-data' as const;

  public async getAll(): Promise<Certificate[]> {
    return [...certificatesData].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public async getById(id: string): Promise<Certificate | null> {
    const match = certificatesData.find((cert) => cert.id === id);
    return match ? { ...match } : null;
  }

  public async getPublished(): Promise<Certificate[]> {
    return certificatesData
      .filter((cert) => cert.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

/**
 * Production Supabase PostgreSQL adapter.
 */
export class SupabaseCertificateAdapter implements ICertificateAdapter {
  public readonly sourceName = 'supabase' as const;

  public async getAll(): Promise<Certificate[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch certificates: ${error.message}`);
    }

    return ((data ?? []) as CertificateRow[]).map(mapCertificateRow);
  }

  public async getById(id: string): Promise<Certificate | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch certificate ${id}: ${error.message}`);
    }

    return data ? mapCertificateRow(data as CertificateRow) : null;
  }

  public async getPublished(): Promise<Certificate[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch published certificates: ${error.message}`);
    }

    return ((data ?? []) as CertificateRow[]).map(mapCertificateRow);
  }
}

function applyCertificateFilters(
  items: Certificate[],
  options?: CertificateQueryOptions,
): Certificate[] {
  if (!options) return items;

  const { category, search } = options;
  const query = search?.trim().toLowerCase() ?? '';

  return items.filter((cert) => {
    const matchesCategory =
      !category || category === 'all' || cert.category === category;

    if (!matchesCategory) return false;
    if (!query) return true;

    const searchableText = [
      cert.title,
      cert.organization,
      cert.description,
      cert.credentialId ?? '',
      String(cert.year),
      ...(cert.highlights ?? []),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(query);
  });
}

class CertificateService {
  private adapter: ICertificateAdapter;

  constructor(
    initialAdapter: ICertificateAdapter = isSupabaseConfigured
      ? new SupabaseCertificateAdapter()
      : new LocalCertificateAdapter(),
  ) {
    this.adapter = initialAdapter;
  }

  public setAdapter(nextAdapter: ICertificateAdapter): void {
    this.adapter = nextAdapter;
  }

  public getActiveSource(): 'local-data' | 'supabase' | 'remote-api' {
    return this.adapter.sourceName;
  }

  public async getCertificates(
    options?: CertificateQueryOptions,
  ): Promise<CertificateAdapterResponse<Certificate[]>> {
    const raw = options?.includeUnpublished
      ? await this.adapter.getAll()
      : await this.adapter.getPublished();

    const filtered = applyCertificateFilters(raw, options);

    return {
      data: filtered,
      source: this.adapter.sourceName,
      fetchedAt: new Date().toISOString(),
    };
  }

  public async getCertificateById(
    id: string,
  ): Promise<CertificateAdapterResponse<Certificate | null>> {
    const cert = await this.adapter.getById(id);
    return {
      data: cert,
      source: this.adapter.sourceName,
      fetchedAt: new Date().toISOString(),
    };
  }

  public async getPublishedCertificates(
    options?: Omit<CertificateQueryOptions, 'includeUnpublished'>,
  ): Promise<CertificateAdapterResponse<Certificate[]>> {
    const published = await this.adapter.getPublished();
    const filtered = applyCertificateFilters(published, options);

    return {
      data: filtered,
      source: this.adapter.sourceName,
      fetchedAt: new Date().toISOString(),
    };
  }

  public async getAvailableCategories(): Promise<CertificateCategory[]> {
    const published = await this.adapter.getPublished();
    const categories = new Set<CertificateCategory>();
    for (const cert of published) {
      categories.add(cert.category);
    }
    return Array.from(categories);
  }
}

export const certificateService = new CertificateService();

export const getCertificates = (options?: CertificateQueryOptions) =>
  certificateService.getCertificates(options);

export const getCertificateById = (id: string) =>
  certificateService.getCertificateById(id);

export const getPublishedCertificates = (
  options?: Omit<CertificateQueryOptions, 'includeUnpublished'>,
) => certificateService.getPublishedCertificates(options);

export async function createCertificate(
  input: CertificateUpsertInput,
): Promise<Certificate> {
  const supabase = getSupabaseClient();
  const payload = {
    title: input.title.trim(),
    organization: input.organization.trim(),
    recipient_name: input.recipientName?.trim() || null,
    year: input.year,
    issue_date: input.issueDate.trim(),
    valid_until: input.validUntil?.trim() || null,
    credential_id: input.credentialId?.trim() || null,
    description: input.description.trim(),
    category: input.category,
    asset_url: input.assetUrl.trim(),
    storage_path: input.storagePath ?? null,
    asset_type: input.assetType,
    thumbnail_url: input.thumbnailUrl ?? null,
    highlights: input.highlights ?? [],
    achievement_details: input.aiExtractedJson?.achievement_details ?? input.highlights ?? [],
    ai_generated_description: input.aiExtractedJson?.description ?? null,
    ai_analysis_status: input.aiExtractedJson
      ? (input.aiReviewed ? 'reviewed' : 'completed')
      : 'pending',
    ai_confidence: input.aiExtractedJson?.confidence ?? null,
    ai_extracted_json: input.aiExtractedJson ?? null,
    ai_reviewed: input.aiReviewed ?? false,
    status: input.status,
    sort_order: input.sortOrder ?? 0,
  };

  const { data, error } = await supabase
    .from('certificates')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create certificate: ${error?.message ?? 'Unknown error'}`);
  }

  return mapCertificateRow(data as CertificateRow);
}

export async function updateCertificate(
  id: string,
  input: Partial<CertificateUpsertInput>,
): Promise<Certificate> {
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = {};

  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.organization !== undefined) patch.organization = input.organization.trim();
  if (input.recipientName !== undefined) patch.recipient_name = input.recipientName?.trim() || null;
  if (input.year !== undefined) patch.year = input.year;
  if (input.issueDate !== undefined) patch.issue_date = input.issueDate.trim();
  if (input.validUntil !== undefined) patch.valid_until = input.validUntil?.trim() || null;
  if (input.credentialId !== undefined) patch.credential_id = input.credentialId?.trim() || null;
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.category !== undefined) patch.category = input.category;
  if (input.assetUrl !== undefined) patch.asset_url = input.assetUrl.trim();
  if (input.storagePath !== undefined) patch.storage_path = input.storagePath;
  if (input.assetType !== undefined) patch.asset_type = input.assetType;
  if (input.thumbnailUrl !== undefined) patch.thumbnail_url = input.thumbnailUrl;
  if (input.highlights !== undefined) patch.highlights = input.highlights;
  if (input.aiExtractedJson !== undefined) {
    patch.ai_extracted_json = input.aiExtractedJson;
    patch.achievement_details =
      input.aiExtractedJson?.achievement_details ?? input.highlights ?? [];
    patch.ai_generated_description = input.aiExtractedJson?.description ?? null;
    patch.ai_confidence = input.aiExtractedJson?.confidence ?? null;
    patch.ai_analysis_status = input.aiExtractedJson
      ? (input.aiReviewed ? 'reviewed' : 'completed')
      : 'pending';
  }
  if (input.aiReviewed !== undefined) patch.ai_reviewed = input.aiReviewed;
  if (input.status !== undefined) patch.status = input.status;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const { data, error } = await supabase
    .from('certificates')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update certificate: ${error?.message ?? 'Unknown error'}`);
  }

  return mapCertificateRow(data as CertificateRow);
}

export async function deleteCertificate(
  id: string,
  storagePath?: string | null,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('certificates').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete certificate: ${error.message}`);
  }

  if (storagePath) {
    await deleteStorageObject('portfolio-certificates', storagePath);
  }
}

export interface AnalyzeCertificateResponse {
  extracted: CertificateExtractionResult;
  model: string;
  requiresAdminApproval: boolean;
  analyzedAt: string;
}

export async function analyzeCertificateWithAI(
  storagePath: string,
  mimeType: string,
): Promise<AnalyzeCertificateResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<
    AnalyzeCertificateResponse & { error?: string }
  >('analyze-certificate', {
    body: { storagePath, mimeType },
  });

  if (error) {
    throw new Error(error.message || 'Certificate AI analysis failed.');
  }

  if (!data || data.error || !data.extracted) {
    throw new Error(data?.error ?? 'AI analysis returned no structured result.');
  }

  return data;
}
