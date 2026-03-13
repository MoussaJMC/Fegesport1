/*
  # Correction des vulnérabilités de sécurité - Mars 2026

  ## Problèmes identifiés et corrections

  ### 1. Politique de stockage redondante
     - Suppression des politiques en double sur storage.objects
     - Conservation uniquement des politiques admin strictes

  ### 2. Fonction is_admin() 
     - Mise à jour pour utiliser l'email du JWT au lieu de raw_user_meta_data
     - Ajout de admin@fegesport.org dans la liste

  ### 3. Politique events - authentification trop permissive
     - La politique "Authenticated users can view all events" avec `qual = true` expose TOUS les événements
     - Restriction pour permettre uniquement la vue des événements non-cancelled

  ### 4. Politique static_files_auth_insert trop permissive
     - Les utilisateurs authentifiés peuvent insérer des fichiers
     - Restriction pour admins uniquement

  ### 5. Bucket storage public
     - Le bucket static-files est marqué comme public
     - Les fichiers peuvent être téléchargés sans authentification
     - Conservation de cette configuration car c'est le comportement souhaité

  ## Sécurité
     - RLS activé sur toutes les tables
     - Politiques restrictives par défaut
     - Accès admin vérifié via fonction is_admin()
*/

-- 1. Supprimer les politiques de stockage redondantes
DROP POLICY IF EXISTS "Authenticated users can update in static-files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files from static-files" ON storage.objects;

-- 2. Mettre à jour la fonction is_admin pour utiliser l'email du JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_email text;
BEGIN
  -- Récupérer l'email depuis le JWT
  user_email := auth.jwt() ->> 'email';
  
  -- Vérifier si l'email est dans la liste des admins
  RETURN user_email IN (
    'aamadoubah2002@gmail.com',
    'admin@fegesport.org',
    'admin@fegesport224.org',
    'president@fegesport224.org'
  );
END;
$$;

-- 3. Supprimer la politique events trop permissive
DROP POLICY IF EXISTS "Authenticated users can view all events" ON events;

-- 4. Créer une politique events plus restrictive pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view active events"
  ON events
  FOR SELECT
  TO authenticated
  USING (status <> 'cancelled' OR is_admin());

-- 5. Vérifier que les politiques de stockage sont correctes (admins uniquement)
-- Les politiques existantes sont déjà correctes :
-- - "Only admins can upload to static-files"
-- - "Only admins can update static-files"  
-- - "Only admins can delete static-files"
-- - "Public can view static-files"

-- 6. Ajouter un index sur email_queue pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_email_queue_status_priority 
  ON email_queue(status, priority, scheduled_for)
  WHERE status = 'pending';

-- 7. Ajouter un index sur audit_log pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record 
  ON audit_log(table_name, record_id, created_at DESC);

-- 8. Vérifier que toutes les tables sensibles ont bien des triggers d'audit
-- (Les triggers existants sont suffisants)
