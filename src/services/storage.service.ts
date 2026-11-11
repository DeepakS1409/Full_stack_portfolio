import { getSupabaseClient } from '@/lib/supabase';
import type { CertificateAssetType } from '@/types/certificate.types';

export type PortfolioBucket =
  | 'portfolio-certificates'
  | 'portfolio-projects'
  | 'portfolio-achievements'
  | 'portfolio-profile';

const CERT_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'application/pdf',
]);

const IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export interface UploadedAssetResult {
  publicUrl: string;
  storagePath: string;
  mimeType: string;
  assetType: CertificateAssetType;
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateUploadFile(
  bucket: PortfolioBucket,
  file: File,
): { mimeType: string; assetType: CertificateAssetType } {
  const isCertBucket = bucket === 'portfolio-certificates';
  const maxBytes = isCertBucket ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  const allowed = isCertBucket ? CERT_MIME_TYPES : IMAGE_MIME_TYPES;

  if (!allowed.has(file.type)) {
    throw new Error(
      isCertBucket
        ? 'Only PNG, JPG, JPEG, and PDF files are supported for certificates.'
        : 'Only PNG, JPG, JPEG, and WebP images are supported.',
    );
  }

  if (file.size > maxBytes) {
    throw new Error(
      isCertBucket
        ? 'Certificate file must be 10 MB or smaller.'
        : 'Image file must be 5 MB or smaller.',
    );
  }

  return {
    mimeType: file.type,
    assetType: file.type === 'application/pdf' ? 'pdf' : 'image',
  };
}

export async function uploadFileToBucket(
  bucket: PortfolioBucket,
  file: File,
  folder = 'uploads',
): Promise<UploadedAssetResult> {
  const { mimeType, assetType } = validateUploadFile(bucket, file);
  const supabase = getSupabaseClient();

  const safeName = sanitizeFileName(file.name) || `asset-${Date.now()}`;
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `${folder}/${uniquePrefix}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    storagePath,
    mimeType,
    assetType,
  };
}

export async function deleteStorageObject(
  bucket: PortfolioBucket,
  storagePath?: string | null,
): Promise<void> {
  if (!storagePath) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) {
    throw new Error(`Failed to remove storage file: ${error.message}`);
  }
}

