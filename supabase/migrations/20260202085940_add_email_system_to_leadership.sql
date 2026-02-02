/*
  # Système d'emails personnalisés pour la direction
  
  1. Modifications de la table leadership_team
    - Ajout du champ `email` - Adresse email personnelle du membre
    - Ajout du champ `official_email` - Email officiel avec le domaine de l'organisation (ex: president@fegesport.org)
    - Ajout du champ `email_forward_enabled` - Active/désactive le transfert d'emails
    - Ajout du champ `email_signature` - Signature email personnalisée
  
  2. Sécurité
    - Les emails sont visibles publiquement (pour permettre le contact)
    - Seuls les admins peuvent modifier ces informations
  
  3. Notes
    - Les emails officiels peuvent être utilisés comme alias de forwarding
    - La signature peut inclure du HTML pour le formatage
*/

-- Ajouter les colonnes email à la table leadership_team
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leadership_team' AND column_name = 'email'
  ) THEN
    ALTER TABLE leadership_team ADD COLUMN email text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leadership_team' AND column_name = 'official_email'
  ) THEN
    ALTER TABLE leadership_team ADD COLUMN official_email text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leadership_team' AND column_name = 'email_forward_enabled'
  ) THEN
    ALTER TABLE leadership_team ADD COLUMN email_forward_enabled boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leadership_team' AND column_name = 'email_signature'
  ) THEN
    ALTER TABLE leadership_team ADD COLUMN email_signature text;
  END IF;
END $$;

-- Ajouter des contraintes de validation pour les emails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leadership_team_email_format'
  ) THEN
    ALTER TABLE leadership_team
    ADD CONSTRAINT leadership_team_email_format
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leadership_team_official_email_format'
  ) THEN
    ALTER TABLE leadership_team
    ADD CONSTRAINT leadership_team_official_email_format
    CHECK (official_email IS NULL OR official_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Créer un index sur les emails officiels pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_leadership_team_official_email 
ON leadership_team(official_email) 
WHERE official_email IS NOT NULL;

-- Commentaires sur les colonnes pour la documentation
COMMENT ON COLUMN leadership_team.email IS 'Adresse email personnelle du membre de la direction';
COMMENT ON COLUMN leadership_team.official_email IS 'Adresse email officielle avec le domaine de l''organisation (ex: president@fegesport.org)';
COMMENT ON COLUMN leadership_team.email_forward_enabled IS 'Active/désactive le transfert automatique des emails de l''adresse officielle vers l''adresse personnelle';
COMMENT ON COLUMN leadership_team.email_signature IS 'Signature email HTML personnalisée pour ce membre de la direction';