/*
  # Correction des politiques RLS pour email_templates et email_logs
  
  ## Changements
  - Supprime les anciennes politiques qui utilisent une requête sur auth.users
  - Crée de nouvelles politiques utilisant la fonction is_admin()
  - Permet l'accès public en lecture aux templates actifs (pour le frontend)
  
  ## Sécurité
  - Les admins peuvent tout gérer via is_admin()
  - Les templates actifs sont lisibles publiquement pour permettre l'envoi d'emails
  - Les logs restent accessibles uniquement aux admins
*/

-- Supprimer les anciennes politiques email_templates
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;

-- Créer les nouvelles politiques pour email_templates
CREATE POLICY "Anyone can view active templates"
  ON email_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Supprimer les anciennes politiques email_logs
DROP POLICY IF EXISTS "Admins can view email logs" ON email_logs;

-- Créer les nouvelles politiques pour email_logs
CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());
