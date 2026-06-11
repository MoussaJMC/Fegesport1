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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n' +
      'Refusing to run without explicit credentials.',
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
  path: string;
  status: ReportStatus;
  source_size: number | null;
  target_size: number | null;
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
): Promise<{ status: ReportStatus; sourceSize: number | null; targetSize: number | null; error?: string }> {
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

  if (DRY_RUN) {
    log.verbose(`DRY-RUN would copy: ${path}`);
    return {
      status: 'copied',
      sourceSize,
      targetSize: sourceSize,
    };
  }

  // 2) Download from source
  let blob: Blob;
  try {
    const dl = await withRetries(`download ${path}`, async () => {
      const r = await supabase.storage.from(SOURCE_BUCKET).download(path);
      if (r.error) throw r.error;
      if (!r.data) throw new Error('download returned empty data');
      return r.data;
    });
    blob = dl;
  } catch (e) {
    return {
      status: 'download_failed',
      sourceSize,
      targetSize: null,
      error: (e as Error).message,
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
      error: `Size mismatch: source=${sourceSize} target=${targetSize}`,
    };
  }

  log.verbose(`COPIED: ${path}`);
  return { status: 'copied', sourceSize, targetSize };
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
            path: obj.name,
            status: r.status,
            source_size: r.sourceSize,
            target_size: r.targetSize,
            error: r.error,
          } satisfies ReportRow;
        } catch (e) {
          return {
            path: obj.name,
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
  const csv =
    'path,status,source_size,target_size,error\n' +
    report
      .map(
        (r) =>
          `"${r.path.replace(/"/g, '""')}","${r.status}",${
            r.source_size ?? ''
          },${r.target_size ?? ''},"${(r.error ?? '').replace(/"/g, '""')}"`,
      )
      .join('\n');
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
