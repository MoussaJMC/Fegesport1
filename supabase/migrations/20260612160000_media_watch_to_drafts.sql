/*
  # Pipeline Veille → Brouillons — colonnes de traçabilité (additif, non destructif)

  Permet de transformer une source de veille (collected_news) retenue en brouillon
  éditorial (generated_articles via media_events), avec déduplication et traçabilité
  bidirectionnelle.

  AUCUNE publication automatique. AUCUNE RLS modifiée (les tables sont déjà en RLS admin).
  Réutilise la colonne EXISTANTE generated_articles.collected_news_id pour le lien
  article → source (pas de colonne redondante).
*/

-- Source de veille → brouillon : anti-doublon + lien vers l'article produit
ALTER TABLE collected_news ADD COLUMN IF NOT EXISTS used_for_generation boolean NOT NULL DEFAULT false;
ALTER TABLE collected_news ADD COLUMN IF NOT EXISTS generated_article_id uuid;

DO $$ BEGIN
  ALTER TABLE collected_news
    ADD CONSTRAINT collected_news_generated_article_fk
    FOREIGN KEY (generated_article_id) REFERENCES generated_articles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Brouillon : distingue une génération issue de la veille d'une génération manuelle (événement)
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS generated_from_watch boolean NOT NULL DEFAULT false;

-- Index pour l'UI / stats (sources déjà traitées, brouillons issus de la veille)
CREATE INDEX IF NOT EXISTS idx_collected_news_used_for_generation
  ON collected_news(used_for_generation) WHERE used_for_generation = true;
CREATE INDEX IF NOT EXISTS idx_generated_articles_from_watch
  ON generated_articles(generated_from_watch) WHERE generated_from_watch = true;
