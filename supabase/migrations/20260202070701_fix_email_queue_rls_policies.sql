/*
  # Correction des politiques RLS pour email_queue
  
  ## Changements
  - Supprime les anciennes politiques email_queue qui utilisent une requête sur auth.users
  - Crée de nouvelles politiques utilisant la fonction is_admin() existante
  - Permet aux admins authentifiés d'accéder à la queue d'emails
  
  ## Sécurité
  - Utilise is_admin() pour vérifier les droits administrateurs
  - Maintient la sécurité en limitant l'accès aux admins uniquement
*/

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Admins can manage email queue" ON email_queue;

-- Créer les nouvelles politiques pour email_queue avec is_admin()
CREATE POLICY "Admins can view email queue"
  ON email_queue FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert into email queue"
  ON email_queue FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update email queue"
  ON email_queue FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete from email queue"
  ON email_queue FOR DELETE
  TO authenticated
  USING (is_admin());
