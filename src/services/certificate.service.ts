import { certificatesData } from '@/data/certificates.data';
import type {
  Certificate,
  CertificateAdapterResponse,
  CertificateCategory,
  CertificateQueryOptions,
  ICertificateAdapter,
} from '@/types/certificate.types';

/**
 * Local in-memory adapter backed by `src/data/certificates.data.ts`.
 * Serves as the active frontend data source until a backend is connected.
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
 * Future Backend / Supabase Adapter Blueprint.
 * Implement these methods using `fetch()` or `@supabase/supabase-js`
 * and pass an instance to `certificateService.setAdapter(...)` when ready.
 */
export class RemoteApiCertificateAdapter implements ICertificateAdapter {
  public readonly sourceName = 'remote-api' as const;
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public async getAll(): Promise<Certificate[]> {
    const response = await fetch(`${this.baseUrl}/certificates`);
    if (!response.ok) {
      throw new Error(`Failed to fetch certificates (${response.status})`);
    }
    return (await response.json()) as Certificate[];
  }

  public async getById(id: string): Promise<Certificate | null> {
    const response = await fetch(`${this.baseUrl}/certificates/${encodeURIComponent(id)}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch certificate ${id} (${response.status})`);
    }
    return (await response.json()) as Certificate;
  }

  public async getPublished(): Promise<Certificate[]> {
    const all = await this.getAll();
    return all
      .filter((cert) => cert.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder);
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

  constructor(initialAdapter: ICertificateAdapter = new LocalCertificateAdapter()) {
    this.adapter = initialAdapter;
  }

  /**
   * Swap the underlying data source (e.g., LocalCertificateAdapter -> RemoteApiCertificateAdapter)
   * without touching any UI components.
   */
  public setAdapter(nextAdapter: ICertificateAdapter): void {
    this.adapter = nextAdapter;
  }

  public getActiveSource(): 'local-data' | 'remote-api' {
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

