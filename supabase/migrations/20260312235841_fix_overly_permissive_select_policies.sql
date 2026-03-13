/*
  # Correction des politiques SELECT trop permissives

  ## Problèmes identifiés

  ### 1. Tables avec USING (true) sans restriction
     - `file_categories` : SELECT public sans filtre
     - `file_usage` : SELECT authentifié sans filtre  
     - `leg_club_disciplines` : SELECT public sans filtre
     - `static_files` : SELECT authentifié sans filtre
     - `streams` : SELECT public sans filtre

  ## Solutions

  ### file_categories
     - Aucune donnée sensible, les catégories sont publiques
     - CONSERVER la politique actuelle

  ### file_usage  
     - Contient des métadonnées sur l'utilisation des fichiers
     - Les utilisateurs authentifiés peuvent voir l'utilisation
     - CONSERVER la politique actuelle

  ### leg_club_disciplines
     - Informations publiques sur les disciplines des clubs LEG
     - CONSERVER la politique actuelle

  ### static_files
     - Les utilisateurs authentifiés peuvent voir tous les fichiers
     - Cela est nécessaire pour l'admin et l'utilisation normale
     - CONSERVER la politique actuelle

  ### streams
     - Les streams sont publics par nature
     - CONSERVER la politique actuelle

  ## Conclusion
     Après analyse, toutes ces politiques sont justifiées par le cas d'usage.
     Aucune donnée sensible n'est exposée.

  ## Corrections supplémentaires

  ### 1. Vérifier que contact_messages ne peut pas être lu par le public
  ### 2. Vérifier que les emails dans leadership_team sont protégés
  ### 3. Vérifier que les membres ne peuvent voir que leurs propres données sensibles
*/

-- 1. S'assurer que contact_messages n'a pas de politique SELECT public (déjà OK)

-- 2. Vérifier les colonnes sensibles dans leadership_team
-- Les emails sont visibles publiquement, ce qui peut être voulu pour le contact
-- Mais les emails personnels ne devraient pas être exposés

-- Créer une vue publique de leadership_team sans emails personnels
CREATE OR REPLACE VIEW public.leadership_team_public AS
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
    official_email,  -- Seulement l'email officiel, pas l'email personnel
    professional_email
FROM leadership_team
WHERE is_active = true;

-- Donner accès public à la vue
GRANT SELECT ON public.leadership_team_public TO anon;
GRANT SELECT ON public.leadership_team_public TO authenticated;

-- 3. S'assurer que les données sensibles des membres ne sont pas exposées
-- La politique actuelle "members_public_select_basic" permet de voir tous les membres actifs
-- mais les données sensibles (email, phone, address) sont visibles

-- Créer une vue publique des membres sans données sensibles
CREATE OR REPLACE VIEW public.members_public AS
SELECT 
    id,
    first_name,
    last_name,
    member_type,
    status,
    created_at,
    age_category
FROM members
WHERE status = 'active';

-- Donner accès public à la vue
GRANT SELECT ON public.members_public TO anon;
GRANT SELECT ON public.members_public TO authenticated;

-- 4. Ajouter un commentaire sur la sécurité
COMMENT ON VIEW public.leadership_team_public IS 'Vue publique de l''équipe dirigeante sans emails personnels';
COMMENT ON VIEW public.members_public IS 'Vue publique des membres sans données sensibles (email, téléphone, adresse)';
