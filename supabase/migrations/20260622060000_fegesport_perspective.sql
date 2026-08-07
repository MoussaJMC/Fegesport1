/*
  # FEGESPORT Perspective — couche stratégique (additif, non destructif)

  Champs structurés produits par l'IA (uniquement pour les articles issus de la veille)
  pour transformer chaque article en levier de positionnement et de recrutement.

  Les sections rédactionnelles (« Et en Guinée ? », « La position de la FEGESPORT »,
  « Opportunités pour la Guinée », CTA) sont intégrées DANS le markdown de l'article
  (generated_articles.content) — aucune colonne pour elles.

  AUCUNE RLS modifiée. AUCUN secret. AUCUNE Edge Function (côté SQL).
*/

ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS fegesport_category text;
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS recruitment_objective text;
-- { impact, recruitment, institutional, media_visibility, partnership } (0-100)
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS strategic_scores jsonb;
-- Miroir indexable de strategic_scores.impact pour la priorisation/tri
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS fegesport_impact_score integer
  CHECK (fegesport_impact_score BETWEEN 0 AND 100);

CREATE INDEX IF NOT EXISTS idx_generated_articles_impact
  ON generated_articles(fegesport_impact_score DESC) WHERE fegesport_impact_score IS NOT NULL;
