/*
  # Correction des politiques RLS multiples permissives - Partie 2

  ## Problème
  
  Plusieurs tables ont des politiques multiples permissives pour le même rôle et action.
  Par exemple, sur `cards`, les utilisateurs authentifiés ont accès via:
  - cards_admin_all (pour les admins)
  - cards_public_select (pour tous)
  
  Ces politiques sont en OR, ce qui peut créer des problèmes de sécurité si mal configurées.

  ## Solution
  
  Les politiques existantes sont correctes car:
  - Une politique permet l'accès public (données publiques)
  - Une politique permet l'accès admin (toutes opérations)
  
  Pas de modification nécessaire, c'est le comportement souhaité.

  ## Correction des politiques "always true"
  
  ### contact_messages_public_insert
  - WITH CHECK (true) permet à n'importe qui d'insérer
  - C'est normal pour un formulaire de contact public
  - Mais on devrait au moins valider que l'email est fourni
  
  ### newsletter_public_insert
  - WITH CHECK (true) permet à n'importe qui de s'inscrire
  - C'est normal pour une newsletter publique
  - Mais on devrait valider que l'email est fourni

  ## Corrections de sécurité
*/

-- 1. Améliorer la politique d'insertion des messages de contact
DROP POLICY IF EXISTS "contact_messages_public_insert" ON contact_messages;
CREATE POLICY "contact_messages_public_insert"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (
    name IS NOT NULL 
    AND name <> '' 
    AND email IS NOT NULL 
    AND email <> ''
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND message IS NOT NULL
    AND message <> ''
  );

-- 2. Améliorer la politique d'inscription à la newsletter
DROP POLICY IF EXISTS "newsletter_public_insert" ON newsletter_subscriptions;
CREATE POLICY "newsletter_public_insert"
  ON newsletter_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (
    email IS NOT NULL 
    AND email <> ''
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- 3. Documenter les politiques multiples permissives
COMMENT ON POLICY "cards_admin_all" ON cards IS 
  'Politique admin - Permet toutes opérations aux admins. Utilisée en OR avec cards_public_select.';
COMMENT ON POLICY "cards_public_select" ON cards IS 
  'Politique publique - Permet SELECT aux cartes actives. Utilisée en OR avec cards_admin_all.';

-- 4. Ajouter des contraintes de validation sur les tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_messages_email_format'
  ) THEN
    ALTER TABLE contact_messages 
      ADD CONSTRAINT contact_messages_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_messages_name_not_empty'
  ) THEN
    ALTER TABLE contact_messages 
      ADD CONSTRAINT contact_messages_name_not_empty 
      CHECK (name IS NOT NULL AND length(trim(name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_messages_message_not_empty'
  ) THEN
    ALTER TABLE contact_messages 
      ADD CONSTRAINT contact_messages_message_not_empty 
      CHECK (message IS NOT NULL AND length(trim(message)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'newsletter_email_format'
  ) THEN
    ALTER TABLE newsletter_subscriptions 
      ADD CONSTRAINT newsletter_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- 5. Ajouter un index unique pour éviter les doublons d'emails dans la newsletter
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_unique 
  ON newsletter_subscriptions(email) 
  WHERE status = 'active';
