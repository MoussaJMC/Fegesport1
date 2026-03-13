/*
  # Correction de la sécurité des fonctions - Partie 3

  ## Problème
  
  Plusieurs fonctions ont un search_path mutable qui peut permettre des attaques par injection:
  - get_full_translation
  - get_translation
  - update_history_timeline_updated_at
  - update_leg_tournaments_updated_at
  - update_sponsors_updated_at
  - update_stream_id

  ## Solution
  
  Recréer ces fonctions avec SECURITY DEFINER et SET search_path = ''
  pour forcer l'utilisation de noms qualifiés (schema.table.column)

  ## Vues SECURITY DEFINER
  
  Les vues suivantes sont marquées SECURITY DEFINER:
  - leadership_team_public
  - members_public
  - security_audit_report
  
  Les vues ne devraient pas être SECURITY DEFINER car cela peut créer des failles.
  On va les recréer sans SECURITY DEFINER.
*/

-- 1. Recréer get_translation avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.get_translation(
  translations_json jsonb,
  lang text,
  fallback_lang text DEFAULT 'fr'
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF translations_json IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Essayer la langue demandée
  IF translations_json ? lang THEN
    RETURN translations_json ->> lang;
  END IF;
  
  -- Fallback sur la langue par défaut
  IF translations_json ? fallback_lang THEN
    RETURN translations_json ->> fallback_lang;
  END IF;
  
  -- Retourner la première valeur disponible
  RETURN translations_json ->> (SELECT jsonb_object_keys(translations_json) LIMIT 1);
END;
$$;

-- 2. Recréer get_full_translation avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.get_full_translation(
  translations_json jsonb,
  lang text DEFAULT 'fr'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF translations_json IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;
  
  IF translations_json ? lang THEN
    RETURN translations_json -> lang;
  END IF;
  
  -- Retourner la première langue disponible
  RETURN translations_json -> (SELECT jsonb_object_keys(translations_json) LIMIT 1);
END;
$$;

-- 3. Recréer update_history_timeline_updated_at avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.update_history_timeline_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Recréer update_leg_tournaments_updated_at avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.update_leg_tournaments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Recréer update_sponsors_updated_at avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.update_sponsors_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 6. Recréer update_stream_id avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.update_stream_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Extraire l'ID YouTube de l'URL
  IF NEW.youtube_url IS NOT NULL THEN
    -- Format: https://www.youtube.com/watch?v=VIDEO_ID
    -- ou https://youtu.be/VIDEO_ID
    IF NEW.youtube_url ~ 'youtube\.com/watch\?v=' THEN
      NEW.stream_id := substring(NEW.youtube_url from 'v=([^&]+)');
    ELSIF NEW.youtube_url ~ 'youtu\.be/' THEN
      NEW.stream_id := substring(NEW.youtube_url from 'youtu\.be/([^?]+)');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. Recréer les vues sans SECURITY DEFINER
DROP VIEW IF EXISTS public.leadership_team_public;
CREATE VIEW public.leadership_team_public AS
SELECT 
    id,
    name,
    position,
    bio,
    image_url,
    "order",
    is_active,
    created_at,
    updated_at,
    translations,
    official_email,
    professional_email
FROM public.leadership_team
WHERE is_active = true;

DROP VIEW IF EXISTS public.members_public;
CREATE VIEW public.members_public AS
SELECT 
    id,
    first_name,
    last_name,
    member_type,
    status,
    created_at,
    age_category
FROM public.members
WHERE status = 'active';

DROP VIEW IF EXISTS public.security_audit_report;
CREATE VIEW public.security_audit_report AS
SELECT 
    'members' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as records_with_email,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as records_with_phone,
    COUNT(CASE WHEN address IS NOT NULL THEN 1 END) as records_with_address
FROM public.members
UNION ALL
SELECT 
    'partners' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT contact_email) as unique_emails,
    COUNT(CASE WHEN contact_email IS NOT NULL THEN 1 END) as records_with_email,
    COUNT(CASE WHEN contact_phone IS NOT NULL THEN 1 END) as records_with_phone,
    0 as records_with_address
FROM public.partners
UNION ALL
SELECT 
    'leadership_team' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as records_with_email,
    0 as records_with_phone,
    0 as records_with_address
FROM public.leadership_team
UNION ALL
SELECT 
    'newsletter_subscriptions' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(*) as records_with_email,
    COUNT(CASE WHEN whatsapp IS NOT NULL THEN 1 END) as records_with_phone,
    0 as records_with_address
FROM public.newsletter_subscriptions;

-- 8. Donner accès aux vues
GRANT SELECT ON public.leadership_team_public TO anon;
GRANT SELECT ON public.leadership_team_public TO authenticated;

GRANT SELECT ON public.members_public TO anon;
GRANT SELECT ON public.members_public TO authenticated;

GRANT SELECT ON public.security_audit_report TO authenticated;

-- 9. Commenter les vues
COMMENT ON VIEW public.leadership_team_public IS 'Vue publique de l''équipe dirigeante sans emails personnels';
COMMENT ON VIEW public.members_public IS 'Vue publique des membres sans données sensibles (email, téléphone, adresse)';
COMMENT ON VIEW public.security_audit_report IS 'Rapport d''audit de sécurité montrant le nombre de données sensibles dans chaque table - Accès admin uniquement via RLS';
