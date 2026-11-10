export type CertificateAssetType = 'image' | 'pdf';

export type CertificateStatus = 'published' | 'draft' | 'archived';

export type CertificateCategory =
  | 'hackathon'
  | 'membership'
  | 'certification'
  | 'workshop';

export interface Certificate {
  id: string;
  title: string;
  organization: string;
  year: number;
  issueDate: string;
  validUntil?: string;
  credentialId?: string;
  description: string;
  category: CertificateCategory;
  /** URL or imported asset path to the certificate image or PDF */
  assetUrl: string;
  assetType: CertificateAssetType;
  /** Optional lightweight preview image (used for PDFs or large scans) */
  thumbnailUrl?: string;
  /** True while using a placeholder visual until the real scan/PDF is uploaded */
  isPlaceholderAsset?: boolean;
  /** Key metadata points (e.g., Rank, Score, Membership tier) */
  highlights?: string[];
  status: CertificateStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateQueryOptions {
  category?: CertificateCategory | 'all';
  search?: string;
  includeUnpublished?: boolean;
}

export interface CertificateAdapterResponse<T> {
  data: T;
  source: 'local-data' | 'remote-api';
  fetchedAt: string;
}

/**
 * Backend-agnostic adapter contract.
 * Swap LocalCertificateAdapter with an API/Supabase adapter later
 * without changing any React components.
 */
export interface ICertificateAdapter {
  readonly sourceName: 'local-data' | 'remote-api';
  getAll(): Promise<Certificate[]>;
  getById(id: string): Promise<Certificate | null>;
  getPublished(): Promise<Certificate[]>;
}

