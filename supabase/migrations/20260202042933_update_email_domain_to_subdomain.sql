/*
  # Mise à jour du domaine email vers le sous-domaine

  ## Description
  Met à jour toutes les références du domaine email pour utiliser le sous-domaine
  contact.fegesport224.org qui a été configuré et vérifié dans Resend.

  ## Modifications
  - Mise à jour de from_email par défaut : noreply@contact.fegesport224.org
  - Mise à jour de la fonction get_email_defaults() pour utiliser le sous-domaine
  - Mise à jour de reply_to vers contact@contact.fegesport224.org

  ## Notes
  - Le domaine contact.fegesport224.org a été vérifié dans Resend
  - Tous les nouveaux emails utiliseront automatiquement ce domaine
  - Les emails existants en file d'attente ne seront pas affectés
*/

-- Modifier la valeur par défaut de from_email dans email_queue
ALTER TABLE email_queue 
  ALTER COLUMN from_email SET DEFAULT 'noreply@contact.fegesport224.org';

-- Mettre à jour la fonction get_email_defaults pour utiliser le sous-domaine
CREATE OR REPLACE FUNCTION get_email_defaults()
RETURNS TABLE (
  from_email text,
  from_name text,
  reply_to text,
  domain text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT 
    'noreply@contact.fegesport224.org'::text as from_email,
    'FEGESPORT'::text as from_name,
    'contact@contact.fegesport224.org'::text as reply_to,
    'contact.fegesport224.org'::text as domain;
END;
$$;

-- Mettre à jour le commentaire de la table
COMMENT ON TABLE email_templates IS 'Templates d''emails avec support multilingue. Emails envoyés depuis noreply@contact.fegesport224.org par défaut.';

COMMENT ON FUNCTION get_email_defaults() IS 'Retourne les paramètres d''email par défaut pour l''application. Domaine configuré : contact.fegesport224.org';
