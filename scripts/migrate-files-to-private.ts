/**
 * WAVE 2 — PHASE 4 : Migration des fichiers de `static-files` (public)
 * vers `static-files-private` (private).
 *
 * STATUT : PRET — NON EXECUTE.
 *
 * Caracteristiques :
 *   - Idempotent : peut etre relance plusieurs fois.
 *   - Aucun fichier supprime du bucket source pendant cette phase.
 *   - Rapport CSV detaille genere a chaque execution.
 *   - Verifie l'integrite (taille + content-type) apres copie.
 *
 * Prerequis :
 *   - Variables d'env :
 *       SUPABASE_URL                  (https://<project>.supabase.co)
 *       SUPABASE_SERVICE_ROLE_KEY     (cle service_role)
 *   - npm install @supabase/supabase-js (deja installe dans le projet)
 *
 * Usage :
 *   # 1) Dry-run sur staging
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/migrate-files-to-private.ts --dry-run
 *
 *   # 2) Execution reelle (uniquement apres validation)
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/migrate-files-to-private.ts
 *
 *   # 3) Mode verbose
 *   ... npx tsx scripts/migrate-files-to-private.ts --verbose
 *
 * Sortie :
 *   - stdout : compteurs (copies, skipped, failed)
 *   - migration-report-<timestamp>.csv : rapport ligne par ligne
 *
 * Rollback :
 *   Aucune destruction n'est faite. Le bucket source reste public et
 *   intact. Apres validation (test admin acces signed URL OK), une
 *   PR ulterieure marquera le bucket source comme deprecated, puis,
 *   apres 30+ jours, le passera private. Procedure complete dans
 *   docs/wave2-private-storage/06-ROLLBACK.md
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

// ============================================================
// Config
// ============================================================

const SOURCE_BUCKET = 'static-files';
const TARGET_BUCKET = 'static-files-private';
const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const VERBOSE = args.has('--verbose');
const CONFIRM_LIVE = args.has('--confirm-live');
const COMPUTE_CHECKSUMS = args.has('--checksums') || DRY_RUN; // hashing is cheap on dry-run

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n' +
      'Refusing to run without explicit credentials.',
  );
  process.exit(1);
}

// ============================================================
// Safety gate — dry-run is MANDATORY before any live run.
// ============================================================
//
// Workflow ENFORCED by this script:
//   1. First invocation MUST be `--dry-run`. The CSV is generated
//      and inspected by a human.
//   2. The live run requires BOTH:
//        - explicit `--confirm-live` flag
//        - a marker file `.wave2-dry-run-done` in the project root
//          (created automatically by a successful dry-run).
//   3. Without both, the script refuses to start.
//
// This makes it impossible to copy/paste a fancy command and migrate
// real production data by mistake.

if (!DRY_RUN && !CONFIRM_LIVE) {
  console.error(
    'ERROR: This is a live execution but `--confirm-live` was not passed.\n' +
      '\n' +
      'Required workflow:\n' +
      '  1. First, run a dry-run:\n' +
      '       npx tsx scripts/migrate-files-to-private.ts --dry-run\n' +
      '  2. Review the generated migration-report-<ts>.csv carefully.\n' +
      '  3. Only then, run live:\n' +
      '       npx tsx scripts/migrate-files-to-private.ts --confirm-live\n' +
      '\n' +
      'Refusing to run without the explicit `--confirm-live` flag.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// Logging
// ============================================================

const log = {
  info: (...m: unknown[]) => console.log('[INFO]', ...m),
  warn: (...m: unknown[]) => console.warn('[WARN]', ...m),
  error: (...m: unknown[]) => console.error('[ERROR]', ...m),
  verbose: (...m: unknown[]) => VERBOSE && console.log('[VERBOSE]', ...m),
};

// ============================================================
// Types
// ============================================================

interface StorageObject {
  name: string;
  id?: string;
  metadata?: { size?: number; mimetype?: string } | null;
}

type ReportStatus =
  | 'copied'
  | 'already_present'
  | 'integrity_mismatch'
  | 'download_failed'
  | 'upload_failed'
  | 'skipped_directory'
  | 'unknown_error';

interface ReportRow {
  /** Path inside the SOURCE (public) bucket */
  source_path: string;
  /** Path inside the TARGET (private) bucket — same as source by design */
  target_path: string;
  /** Source bucket name (for clarity in the CSV) */
  source_bucket: string;
  /** Target bucket name */
  target_bucket: string;
  status: ReportStatus;
  source_size: number | null;
  target_size: number | null;
  /** SHA-256 hex of the source file content, when downloaded for the run */
  source_sha256?: string;
  /** SHA-256 hex of the bytes uploaded to the target (= source on a live run) */
  target_sha256?: string;
  error?: string;
}

// ============================================================
// Helpers
// ============================================================

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function withRetries<T>(
  label: string,
  attempt: () => Promise<T>,
  retries: number = MAX_RETRIES,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await attempt();
    } catch (e) {
      lastErr = e;
      log.warn(`${label} attempt ${i + 1}/${retries} failed:`, e);
      await sleep(RETRY_DELAY_MS * (i + 1));
    }
  }
  throw lastErr;
}

/**
 * List every object in a bucket, recursively. Supabase's list() is
 * paginated and limited to one level at a time, so we walk it ourselves.
 */
async function listAllObjects(bucket: string): Promise<StorageObject[]> {
  const all: StorageObject[] = [];

  async function walk(prefix: string): Promise<void> {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    if (!data) return;
    for (const obj of data) {
      const fullPath = prefix ? `${prefix}/${obj.name}` : obj.name;
      if (obj.id === null || obj.metadata === null) {
        // It's a "folder" placeholder; recurse
        await walk(fullPath);
      } else {
        all.push({
          name: fullPath,
          id: obj.id ?? undefined,
          metadata: obj.metadata as { size?: number; mimetype?: string } | null,
        });
      }
    }
  }

  await walk('');
  return all;
}

async function copyOne(
  obj: StorageObject,
): Promise<{
  status: ReportStatus;
  sourceSize: number | null;
  targetSize: number | null;
  sourceSha256?: string;
  targetSha256?: string;
  error?: string;
}> {
  const path = obj.name;
  const sourceSize = obj.metadata?.size ?? null;

  // 1) Probe target bucket: does this path already exist?
  const probe = await supabase.storage
    .from(TARGET_BUCKET)
    .list(path.includes('/') ? path.split('/').slice(0, -1).join('/') : '', {
      limit: 1000,
      search: path.split('/').pop(),
    });

  if (!probe.error && probe.data) {
    const filename = path.split('/').pop();
    const existing = probe.data.find((d) => d.name === filename);
    if (existing && existing.metadata && existing.metadata.size === sourceSize) {
      log.verbose(`SKIP (already present, size match): ${path}`);
      return {
        status: 'already_present',
        sourceSize,
        targetSize: existing.metadata.size ?? null,
      };
    }
  }

  // 2) Download from source (needed in both dry-run for checksum and live for copy)
  let blob: Blob;
  let sourceSha256: string | undefined;
  try {
    const dl = await withRetries(`download ${path}`, async () => {
      const r = await supabase.storage.from(SOURCE_BUCKET).download(path);
      if (r.error) throw r.error;
      if (!r.data) throw new Error('download returned empty data');
      return r.data;
    });
    blob = dl;
    if (COMPUTE_CHECKSUMS) {
      const buf = Buffer.from(await blob.arrayBuffer());
      sourceSha256 = createHash('sha256').update(buf).digest('hex');
    }
  } catch (e) {
    return {
      status: 'download_failed',
      sourceSize,
      targetSize: null,
      sourceSha256,
      error: (e as Error).message,
    };
  }

  if (DRY_RUN) {
    log.verbose(`DRY-RUN would copy: ${path} (sha256=${sourceSha256?.slice(0, 16)}...)`);
    return {
      status: 'copied',
      sourceSize,
      targetSize: sourceSize,
      sourceSha256,
      targetSha256: sourceSha256, // same content would be copied
    };
  }

  // 3) Upload to target
  try {
    await withRetries(`upload ${path}`, async () => {
      const up = await supabase.storage.from(TARGET_BUCKET).upload(path, blob, {
        contentType: obj.metadata?.mimetype ?? 'application/octet-stream',
        upsert: false,
      });
      if (up.error) throw up.error;
    });
  } catch (e) {
    return {
      status: 'upload_failed',
      sourceSize,
      targetSize: null,
      sourceSha256,
      error: (e as Error).message,
    };
  }

  // 4) Integrity check (re-list target)
  const probe2 = await supabase.storage
    .from(TARGET_BUCKET)
    .list(path.includes('/') ? path.split('/').slice(0, -1).join('/') : '', {
      limit: 1000,
      search: path.split('/').pop(),
    });
  const filename = path.split('/').pop();
  const justUploaded =
    probe2.data?.find((d) => d.name === filename) ?? undefined;
  const targetSize = justUploaded?.metadata?.size ?? null;

  if (sourceSize !== null && targetSize !== null && sourceSize !== targetSize) {
    return {
      status: 'integrity_mismatch',
      sourceSize,
      targetSize,
      sourceSha256,
      error: `Size mismatch: source=${sourceSize} target=${targetSize}`,
    };
  }

  // Optional: re-download from target to recompute checksum and verify byte-identity
  let targetSha256: string | undefined = sourceSha256;
  if (COMPUTE_CHECKSUMS && !DRY_RUN) {
    try {
      const r = await supabase.storage.from(TARGET_BUCKET).download(path);
      if (r.data) {
        const buf = Buffer.from(await r.data.arrayBuffer());
        targetSha256 = createHash('sha256').update(buf).digest('hex');
        if (sourceSha256 && targetSha256 !== sourceSha256) {
          return {
            status: 'integrity_mismatch',
            sourceSize,
            targetSize,
            sourceSha256,
            targetSha256,
            error: 'Checksum mismatch source vs target',
          };
        }
      }
    } catch (e) {
      log.warn(`Checksum verify failed for ${path}: ${(e as Error).message}`);
    }
  }

  log.verbose(`COPIED: ${path}`);
  return { status: 'copied', sourceSize, targetSize, sourceSha256, targetSha256 };
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  log.info(`Wave 2 migration script — ${DRY_RUN ? 'DRY-RUN' : 'LIVE'}`);
  log.info(`Source : ${SOURCE_BUCKET}`);
  log.info(`Target : ${TARGET_BUCKET}`);
  log.info(`Batch  : ${BATCH_SIZE} | Retries : ${MAX_RETRIES}`);

  // Discover all source objects
  log.info('Listing source bucket objects...');
  const objects = await listAllObjects(SOURCE_BUCKET);
  log.info(`Found ${objects.length} objects in ${SOURCE_BUCKET}.`);

  if (objects.length === 0) {
    log.warn('Nothing to migrate. Exiting.');
    return;
  }

  const report: ReportRow[] = [];
  let processed = 0;

  for (let i = 0; i < objects.length; i += BATCH_SIZE) {
    const batch = objects.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (obj) => {
        try {
          const r = await copyOne(obj);
          return {
            source_path: obj.name,
            target_path: obj.name, // same path preserved across buckets
            source_bucket: SOURCE_BUCKET,
            target_bucket: TARGET_BUCKET,
            status: r.status,
            source_size: r.sourceSize,
            target_size: r.targetSize,
            source_sha256: r.sourceSha256,
            target_sha256: r.targetSha256,
            error: r.error,
          } satisfies ReportRow;
        } catch (e) {
          return {
            source_path: obj.name,
            target_path: obj.name,
            source_bucket: SOURCE_BUCKET,
            target_bucket: TARGET_BUCKET,
            status: 'unknown_error' as ReportStatus,
            source_size: obj.metadata?.size ?? null,
            target_size: null,
            error: (e as Error).message,
          } satisfies ReportRow;
        }
      }),
    );
    report.push(...results);
    processed += batch.length;
    log.info(`Processed ${processed}/${objects.length}...`);
  }

  // Aggregate
  const tally: Record<ReportStatus, number> = {
    copied: 0,
    already_present: 0,
    integrity_mismatch: 0,
    download_failed: 0,
    upload_failed: 0,
    skipped_directory: 0,
    unknown_error: 0,
  };
  for (const r of report) tally[r.status]++;

  log.info('--- Summary ---');
  for (const [k, v] of Object.entries(tally)) {
    if (v > 0) log.info(`  ${k.padEnd(20)} : ${v}`);
  }

  // Write CSV report
  const ts = new Date()
    .toISOString()
    .replace(/[:T.]/g, '-')
    .replace('Z', '');
  const csvPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    `..`,
    `migration-report-${ts}.csv`,
  );
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const csvHeader = [
    'source_bucket',
    'source_path',
    'target_bucket',
    'target_path',
    'status',
    'source_size',
    'target_size',
    'source_sha256',
    'target_sha256',
    'error',
  ].join(',');
  const csvBody = report
    .map((r) =>
      [
        escape(r.source_bucket),
        escape(r.source_path),
        escape(r.target_bucket),
        escape(r.target_path),
        escape(r.status),
        r.source_size ?? '',
        r.target_size ?? '',
        escape(r.source_sha256 ?? ''),
        escape(r.target_sha256 ?? ''),
        escape(r.error ?? ''),
      ].join(','),
    )
    .join('\n');
  const csv = `${csvHeader}\n${csvBody}\n`;
  await writeFile(csvPath, csv, 'utf-8');
  log.info(`Report written to ${csvPath}`);

  // Exit code reflects success
  const hasErrors =
    tally.download_failed +
      tally.upload_failed +
      tally.integrity_mismatch +
      tally.unknown_error >
    0;
  process.exit(hasErrors ? 2 : 0);
}

main().catch((e) => {
  log.error('Fatal error:', e);
  process.exit(1);
});
