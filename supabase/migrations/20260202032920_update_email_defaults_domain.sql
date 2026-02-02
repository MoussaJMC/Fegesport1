/*
  # Mise à jour des paramètres d'email par défaut

  ## Description
  Configure les adresses email par défaut pour utiliser le domaine personnalisé fegesport.org
  au lieu des valeurs génériques. Cela permet d'envoyer des emails depuis noreply@fegesport.org
  une fois le domaine vérifié dans Resend.

  ## Modifications
  - Mise à jour de la colonne from_email par défaut dans email_queue
  - Mise à jour des templates existants pour utiliser le bon expéditeur

  ## Notes
  - Assurez-vous que le domaine fegesport.org est vérifié dans Resend avant d'envoyer des emails
  - Les emails existants en file d'attente ne seront pas affectés
*/

-- Modifier la valeur par défaut de from_email dans email_queue
ALTER TABLE email_queue 
  ALTER COLUMN from_email SET DEFAULT 'noreply@fegesport.org';

-- Mettre à jour les templates pour utiliser le bon domaine de réponse
-- (les templates n'ont pas de from_email mais cela aide à documenter)
COMMENT ON TABLE email_templates IS 'Templates d''emails avec support multilingue. Emails envoyés depuis noreply@fegesport.org par défaut.';

-- Créer une fonction pour obtenir les paramètres d'email par défaut
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
    'noreply@fegesport.org'::text as from_email,
    'FEGESPORT'::text as from_name,
    'contact@fegesport.org'::text as reply_to,
    'fegesport.org'::text as domain;
END;
$$;

-- Commenter la fonction
COMMENT ON FUNCTION get_email_defaults() IS 'Retourne les paramètres d''email par défaut pour l''application';
