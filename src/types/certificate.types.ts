export type CertificateAssetType = 'image' | 'pdf';

export type CertificateStatus = 'published' | 'draft' | 'archived';

export type CertificateCategory =
  | 'hackathon'
  | 'membership'
  | 'certification'
  | 'workshop';

export interface CertificateExtractionResult {
  title: string | null;
  organization: string | null;
  recipient_name: string | null;
  description: string | null;
  issue_date: string | null;
  year: number | null;
  category: CertificateCategory | null;
  credential_id: string | null;
  achievement_details: string[];
  confidence: 'high' | 'medium' | 'low';
  fields_requiring_review: string[];
}

export interface Certificate {
  id: string;
  slug?: string | null;
  title: string;
  organization: string;
  recipientName?: string | null;
  year: number;
  issueDate: string;
  validUntil?: string | null;
  credentialId?: string | null;
  description: string;
  category: CertificateCategory;
  /** URL or imported asset path to the certificate image or PDF */
  assetUrl: string;
  storagePath?: string | null;
  assetType: CertificateAssetType;
  /** Optional lightweight preview image (used for PDFs or large scans) */
  thumbnailUrl?: string | null;
  /** True while using a placeholder visual until the real scan/PDF is uploaded */
  isPlaceholderAsset?: boolean;
  /** Key metadata points (e.g., Rank, Score, Membership tier) */
  highlights?: string[];
  aiExtractedJson?: CertificateExtractionResult | null;
  aiReviewed?: boolean;
  status: CertificateStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateUpsertInput {
  title: string;
  organization: string;
  recipientName?: string | null;
  year: number;
  issueDate: string;
  validUntil?: string | null;
  credentialId?: string | null;
  description: string;
  category: CertificateCategory;
  assetUrl: string;
  storagePath?: string | null;
  assetType: CertificateAssetType;
  thumbnailUrl?: string | null;
  highlights?: string[];
  aiExtractedJson?: CertificateExtractionResult | null;
  aiReviewed?: boolean;
  status: CertificateStatus;
  sortOrder?: number;
}

export interface CertificateQueryOptions {
  category?: CertificateCategory | 'all';
  search?: string;
  includeUnpublished?: boolean;
}

export interface CertificateAdapterResponse<T> {
  data: T;
  source: 'local-data' | 'supabase' | 'remote-api';
  fetchedAt: string;
}

/**
 * Backend-agnostic adapter contract.
 */
export interface ICertificateAdapter {
  readonly sourceName: 'local-data' | 'supabase' | 'remote-api';
  getAll(): Promise<Certificate[]>;
  getById(id: string): Promise<Certificate | null>;
  getPublished(): Promise<Certificate[]>;
}
