/*
  # Diffusion multicanale — Phase A : file d'attente (additif, non destructif)

  Une ligne par (événement × canal). Phase A : AUCUNE publication réelle, AUCUN appel API.
  Le bouton "Diffuser" marque les canaux en 'ready' / 'skipped' et journalise.
  Les statuts queued/publishing/published/failed + colonnes external_* sont créés dès
  maintenant pour accueillir l'intégration API (Phase B+) sans nouvelle migration.

  AUCUNE RLS existante modifiée. AUCUN secret. AUCUNE Edge Function.
*/

CREATE TABLE IF NOT EXISTS distribution_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES media_events(id) ON DELETE CASCADE,
  generated_article_id uuid REFERENCES generated_articles(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('facebook', 'linkedin', 'twitter', 'telegram', 'whatsapp', 'newsletter')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready', 'queued', 'publishing', 'published', 'failed', 'skipped')),
  payload_ref uuid,              -- social_posts.id ou newsletter_campaigns.id
  content_preview text,          -- snapshot du texte à copier/diffuser
  external_id text,              -- réservé API (Phase B+) : id du post distant
  external_url text,             -- réservé API : URL du post distant
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  queued_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, channel)     -- anti-doublon : 1 ligne par canal par événement
);

CREATE INDEX IF NOT EXISTS idx_distribution_queue_event ON distribution_queue(event_id);
CREATE INDEX IF NOT EXISTS idx_distribution_queue_status ON distribution_queue(status);
CREATE INDEX IF NOT EXISTS idx_distribution_queue_article ON distribution_queue(generated_article_id);

-- updated_at (réutilise la fonction existante update_updated_at_column)
DROP TRIGGER IF EXISTS set_updated_at_distribution_queue ON distribution_queue;
CREATE TRIGGER set_updated_at_distribution_queue
  BEFORE UPDATE ON distribution_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS : réservé aux admins (mêmes règles que les autres tables du Centre Média)
ALTER TABLE distribution_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_distribution_queue" ON distribution_queue;
CREATE POLICY "admin_all_distribution_queue" ON distribution_queue
  FOR ALL TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
