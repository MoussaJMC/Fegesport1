/*
  # Mise à jour du domaine email vers fegesport224.org

  ## Changements effectués
  
  1. Ajout d'une colonne pour les emails professionnels
     - Ajout de `professional_email` dans `leadership_team`
     - Permet d'avoir des emails @fegesport224.org pour chaque membre
  
  2. Mise à jour des emails professionnels de la direction
     - Président : president@fegesport224.org
     - Secrétaire Général : secretaire@fegesport224.org
     - Autres postes : format standardisé
  
  3. Mise à jour du domaine par défaut
     - Ajout/mise à jour du paramètre `email_domain` dans `site_settings`
     - Valeur : fegesport224.org
  
  ## Configuration DNS requise
  
  Après cette migration, vous devez configurer les enregistrements DNS :
  
  1. Connectez-vous à Resend : https://resend.com/domains
  2. Ajoutez le domaine : fegesport224.org
  3. Resend vous fournira des enregistrements DNS à ajouter chez votre hébergeur
  4. Ajoutez ces enregistrements (SPF, DKIM, MX, CNAME)
  5. Vérifiez le domaine dans Resend (peut prendre quelques minutes)
  
  ## Variables d'environnement
  
  Vous devrez ajouter votre clé API Resend dans les variables d'environnement :
  - RESEND_API_KEY=re_xxxxxxxxxxxxx (à obtenir depuis Resend)
*/

-- Ajouter la colonne professional_email si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leadership_team' AND column_name = 'professional_email'
  ) THEN
    ALTER TABLE leadership_team ADD COLUMN professional_email TEXT;
    COMMENT ON COLUMN leadership_team.professional_email IS 'Email professionnel @fegesport224.org du membre';
  END IF;
END $$;

-- Mettre à jour les emails professionnels pour chaque membre de la direction
UPDATE leadership_team
SET professional_email = 'president@fegesport224.org'
WHERE position = 'Président';

UPDATE leadership_team
SET professional_email = 'secretaire@fegesport224.org'
WHERE position = 'Secrétaire Général';

UPDATE leadership_team
SET professional_email = 'juridique@fegesport224.org'
WHERE position = 'Responsable Juridique & Litiges';

UPDATE leadership_team
SET professional_email = 'feminin@fegesport224.org'
WHERE position = 'Responsable Section Féminine';

UPDATE leadership_team
SET professional_email = 'formation@fegesport224.org'
WHERE position = 'Responsable Formation & Conférence';

UPDATE leadership_team
SET professional_email = 'eleague@fegesport224.org'
WHERE position = 'Responsable Division eLeague Nationale & Continentale';

UPDATE leadership_team
SET professional_email = 'events@fegesport224.org'
WHERE position = 'Responsable des Events Esport & Tournois';

UPDATE leadership_team
SET professional_email = 'production@fegesport224.org'
WHERE position = 'Responsable Production';

UPDATE leadership_team
SET professional_email = 'strategie@fegesport224.org'
WHERE position = 'Conseiller Stratégique';

UPDATE leadership_team
SET professional_email = 'equipes-nationales@fegesport224.org'
WHERE position = 'Responsable des Equipes Nationales';

-- Ajouter/mettre à jour le paramètre du domaine email dans site_settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES (
  'email_domain',
  '"fegesport224.org"'::jsonb,
  'contact',
  'Domaine utilisé pour les emails professionnels de l''organisation',
  false
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = '"fegesport224.org"'::jsonb,
  updated_at = now();

-- S'assurer que l'email de contact utilise le bon domaine
UPDATE site_settings
SET setting_value = jsonb_set(
  setting_value,
  '{email}',
  '"contact@fegesport224.org"'::jsonb
),
updated_at = now()
WHERE setting_key = 'contact_info';

-- Afficher un résumé
DO $$
DECLARE
  member_count INT;
BEGIN
  SELECT COUNT(*) INTO member_count FROM leadership_team WHERE professional_email IS NOT NULL;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration terminée avec succès !';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Emails professionnels configurés : % membres', member_count;
  RAISE NOTICE 'Domaine email : fegesport224.org';
  RAISE NOTICE '';
  RAISE NOTICE 'PROCHAINES ETAPES IMPORTANTES :';
  RAISE NOTICE '';
  RAISE NOTICE '1. Configuration DNS dans Resend';
  RAISE NOTICE '   -> https://resend.com/domains';
  RAISE NOTICE '   -> Ajoutez : fegesport224.org';
  RAISE NOTICE '';
  RAISE NOTICE '2. Ajoutez les enregistrements DNS fournis par Resend';
  RAISE NOTICE '   Types requis : SPF, DKIM, MX, CNAME';
  RAISE NOTICE '';
  RAISE NOTICE '3. Obtenez votre cle API Resend';
  RAISE NOTICE '   -> https://resend.com/api-keys';
  RAISE NOTICE '';
  RAISE NOTICE '4. Configurez la variable denvironnement';
  RAISE NOTICE '   RESEND_API_KEY dans Supabase Edge Functions';
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
END $$;
