/**
 * WAVE 2 — Secure file access helper.
 *
 * Single client-side entry point for resolving private file URLs.
 * Wraps the `get_signed_url` Supabase RPC and falls back gracefully
 * if the project doesn't ship `extensions.create_signed_url`.
 *
 * Usage:
 *   const url = await getSignedFileUrl(file.id);
 *   if (!url) showFallback();
 *
 * Behaviour:
 *   - Always requires an authenticated session at call time. If no
 *     session, returns null (no exception thrown).
 *   - The RPC enforces admin-only access server-side (RLS bypass
 *     via SECURITY DEFINER, but the function gates on is_active_admin).
 *   - If the RPC returns the `object://bucket/path` sentinel (fallback
 *     when no SQL signed-url helper is available), we resolve it
 *     client-side via supabase.storage.from(bucket).createSignedUrl
 *     using the active admin session (RLS on storage.objects still
 *     enforces the admin gate).
 */

import { supabase } from './supabase';

const SENTINEL_PREFIX = 'object://';
const DEFAULT_TTL = 900; // 15 min

export interface GetSignedUrlOptions {
  /** Time-to-live in seconds, clamped to [60, 3600] server-side. */
  ttlSeconds?: number;
  /** When true, throw instead of returning null on error. */
  throwOnError?: boolean;
}

/**
 * Resolve a signed URL for a `static_files` row by id.
 * Returns the URL string, or null on failure.
 */
export async function getSignedFileUrl(
  fileId: string,
  opts: GetSignedUrlOptions = {},
): Promise<string | null> {
  if (!fileId) return null;

  const ttl = Math.max(60, Math.min(3600, opts.ttlSeconds ?? DEFAULT_TTL));

  try {
    const { data, error } = await supabase.rpc('get_signed_url', {
      p_file_id: fileId,
      p_ttl_seconds: ttl,
    });

    if (error) {
      if (opts.throwOnError) throw error;
      // eslint-disable-next-line no-console
      console.warn('[secureFileAccess] RPC error', error.message);
      return null;
    }

    if (typeof data !== 'string' || data.length === 0) {
      if (opts.throwOnError) throw new Error('empty signed url');
      return null;
    }

    // Sentinel path -> resolve via storage client.
    if (data.startsWith(SENTINEL_PREFIX)) {
      const rest = data.slice(SENTINEL_PREFIX.length);
      const slash = rest.indexOf('/');
      if (slash <= 0) {
        if (opts.throwOnError) throw new Error('malformed sentinel');
        return null;
      }
      const bucket = rest.slice(0, slash);
      const objectPath = rest.slice(slash + 1);

      const { data: signed, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(objectPath, ttl);

      if (signErr || !signed?.signedUrl) {
        if (opts.throwOnError) throw signErr ?? new Error('no signed url');
        // eslint-disable-next-line no-console
        console.warn('[secureFileAccess] sentinel sign failed', signErr?.message);
        return null;
      }
      return signed.signedUrl;
    }

    return data;
  } catch (e) {
    if (opts.throwOnError) throw e;
    // eslint-disable-next-line no-console
    console.error('[secureFileAccess] unexpected error', e);
    return null;
  }
}

/**
 * Variant for `official_documents` rows.
 */
export async function getSignedDocumentUrl(
  documentId: string,
  opts: GetSignedUrlOptions = {},
): Promise<string | null> {
  if (!documentId) return null;
  const ttl = Math.max(60, Math.min(3600, opts.ttlSeconds ?? DEFAULT_TTL));

  try {
    const { data, error } = await supabase.rpc('get_signed_url_for_document', {
      p_document_id: documentId,
      p_ttl_seconds: ttl,
    });
    if (error) {
      if (opts.throwOnError) throw error;
      return null;
    }
    if (typeof data !== 'string') return null;

    if (data.startsWith(SENTINEL_PREFIX)) {
      const rest = data.slice(SENTINEL_PREFIX.length);
      const slash = rest.indexOf('/');
      const bucket = rest.slice(0, slash);
      const objectPath = rest.slice(slash + 1);
      const { data: signed } = await supabase.storage
        .from(bucket)
        .createSignedUrl(objectPath, ttl);
      return signed?.signedUrl ?? null;
    }
    return data;
  } catch (e) {
    if (opts.throwOnError) throw e;
    return null;
  }
}
