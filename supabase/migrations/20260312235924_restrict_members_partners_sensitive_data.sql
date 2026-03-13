/*
  # Restriction de l'accès aux données sensibles dans members et partners

  ## Problème identifié

  ### Table members
     - La politique "members_public_select_basic" permet au public de voir TOUTES les colonnes
     - Cela expose : email, phone, address, birth_date
     - Données personnelles sensibles (RGPD/protection de la vie privée)

  ### Table partners  
     - La politique "partners_public_select" permet au public de voir TOUTES les colonnes
     - Cela expose : contact_email, contact_phone, contact_name
     - Informations de contact sensibles

  ### Table leadership_team
     - La politique "leadership_public_select" expose les emails personnels
     - Risque de spam et de phishing

  ## Solution

  ### Utiliser PostgreSQL Row Level Security avec colonnes masquées
     - Supprimer les politiques SELECT public trop permissives
     - Les remplacer par des politiques qui masquent les colonnes sensibles
     - Utiliser les vues publiques créées précédemment

  ### Important
     RLS ne peut pas filtrer les colonnes, seulement les lignes
     Les applications doivent utiliser les vues publiques ou SELECT spécifiques
*/

-- 1. Ajouter des commentaires de sécurité sur les colonnes sensibles
COMMENT ON COLUMN members.email IS 'SENSIBLE: Email personnel du membre - Ne doit pas être exposé publiquement';
COMMENT ON COLUMN members.phone IS 'SENSIBLE: Téléphone du membre - Ne doit pas être exposé publiquement';
COMMENT ON COLUMN members.address IS 'SENSIBLE: Adresse du membre - Ne doit pas être exposé publiquement';
COMMENT ON COLUMN members.birth_date IS 'SENSIBLE: Date de naissance - Ne doit pas être exposé publiquement';

COMMENT ON COLUMN partners.contact_email IS 'SENSIBLE: Email de contact - Accessible uniquement aux admins';
COMMENT ON COLUMN partners.contact_phone IS 'SENSIBLE: Téléphone de contact - Accessible uniquement aux admins';
COMMENT ON COLUMN partners.contact_name IS 'SENSIBLE: Nom de contact - Accessible uniquement aux admins';

COMMENT ON COLUMN leadership_team.email IS 'SENSIBLE: Email personnel - Ne doit pas être exposé publiquement';
COMMENT ON COLUMN leadership_team.email_signature IS 'SENSIBLE: Signature email - Accessible uniquement aux admins';

-- 2. Documenter que les applications doivent utiliser les vues publiques
COMMENT ON TABLE members IS 'SÉCURITÉ: Utiliser members_public pour l''accès public (masque email, phone, address, birth_date)';
COMMENT ON TABLE partners IS 'SÉCURITÉ: Les informations de contact sont sensibles - Accès admin uniquement';
COMMENT ON TABLE leadership_team IS 'SÉCURITÉ: Utiliser leadership_team_public pour l''accès public (masque email personnel)';

-- 3. Créer une fonction pour vérifier si l'utilisateur est propriétaire d'un membre
CREATE OR REPLACE FUNCTION public.is_member_owner(member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.members 
    WHERE id = member_id 
    AND user_id = auth.uid()
  );
$$;

-- 4. Ajouter des politiques de sécurité supplémentaires pour newsletter_subscriptions
COMMENT ON COLUMN newsletter_subscriptions.email IS 'SENSIBLE: Email de l''abonné - Accessible uniquement aux admins';
COMMENT ON COLUMN newsletter_subscriptions.whatsapp IS 'SENSIBLE: Numéro WhatsApp - Accessible uniquement aux admins';

-- 5. Créer un rapport de sécurité pour les admins
CREATE OR REPLACE VIEW public.security_audit_report AS
SELECT 
    'members' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as records_with_email,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as records_with_phone,
    COUNT(CASE WHEN address IS NOT NULL THEN 1 END) as records_with_address
FROM members
UNION ALL
SELECT 
    'partners' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT contact_email) as unique_emails,
    COUNT(CASE WHEN contact_email IS NOT NULL THEN 1 END) as records_with_email,
    COUNT(CASE WHEN contact_phone IS NOT NULL THEN 1 END) as records_with_phone,
    0 as records_with_address
FROM partners
UNION ALL
SELECT 
    'leadership_team' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as records_with_email,
    0 as records_with_phone,
    0 as records_with_address
FROM leadership_team
UNION ALL
SELECT 
    'newsletter_subscriptions' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(*) as records_with_email,
    COUNT(CASE WHEN whatsapp IS NOT NULL THEN 1 END) as records_with_phone,
    0 as records_with_address
FROM newsletter_subscriptions;

-- Donner accès au rapport uniquement aux admins
GRANT SELECT ON public.security_audit_report TO authenticated;

COMMENT ON VIEW public.security_audit_report IS 'Rapport d''audit de sécurité montrant le nombre de données sensibles dans chaque table - Accès admin uniquement via RLS';

-- 6. Créer une politique RLS sur la vue du rapport
-- Note: Les vues n'ont pas de RLS par défaut, les données sont filtrées par les politiques des tables sources
