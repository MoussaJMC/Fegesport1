/*
  # Système complet de gestion des emails

  ## Description
  Création d'un système complet pour gérer la réception, le stockage et l'envoi des emails

  ## Nouvelles tables

  ### email_queue
  - `id` (uuid, clé primaire) - Identifiant unique de l'email
  - `to_email` (text) - Adresse email du destinataire
  - `to_name` (text, optionnel) - Nom du destinataire
  - `from_email` (text) - Adresse email de l'expéditeur
  - `from_name` (text) - Nom de l'expéditeur
  - `reply_to` (text, optionnel) - Adresse email de réponse
  - `subject` (text) - Sujet de l'email
  - `html_content` (text) - Contenu HTML de l'email
  - `text_content` (text, optionnel) - Contenu texte brut de l'email
  - `template_type` (text, optionnel) - Type de template utilisé
  - `template_data` (jsonb, optionnel) - Données pour le template
  - `status` (text) - Statut de l'email (pending, sending, sent, failed)
  - `priority` (integer) - Priorité de l'email (1=haute, 2=normale, 3=basse)
  - `attempts` (integer) - Nombre de tentatives d'envoi
  - `max_attempts` (integer) - Nombre maximum de tentatives
  - `error_message` (text, optionnel) - Message d'erreur en cas d'échec
  - `sent_at` (timestamp, optionnel) - Date et heure d'envoi
  - `scheduled_for` (timestamp, optionnel) - Date et heure planifiée pour l'envoi
  - `created_at` (timestamp) - Date de création
  - `updated_at` (timestamp) - Date de dernière mise à jour

  ### email_templates
  - `id` (uuid, clé primaire) - Identifiant unique du template
  - `name` (text) - Nom du template
  - `type` (text) - Type de template (contact_confirmation, membership_confirmation, etc.)
  - `subject` (text) - Sujet par défaut
  - `html_content` (text) - Contenu HTML du template
  - `text_content` (text, optionnel) - Contenu texte brut du template
  - `variables` (jsonb) - Variables disponibles dans le template
  - `language` (text) - Langue du template (fr, en)
  - `is_active` (boolean) - Template actif ou non
  - `created_at` (timestamp) - Date de création
  - `updated_at` (timestamp) - Date de dernière mise à jour

  ### email_logs
  - `id` (uuid, clé primaire) - Identifiant unique du log
  - `email_queue_id` (uuid) - Référence à l'email dans la queue
  - `event_type` (text) - Type d'événement (queued, sent, delivered, opened, clicked, bounced, failed)
  - `event_data` (jsonb) - Données de l'événement
  - `created_at` (timestamp) - Date de création

  ## Sécurité
  - RLS activé sur toutes les tables
  - Seuls les administrateurs peuvent lire/écrire dans email_queue
  - Seuls les administrateurs peuvent gérer les templates
  - Les logs sont accessibles en lecture seule aux administrateurs

  ## Indexes
  - Index sur email_queue.status pour les requêtes de traitement
  - Index sur email_queue.scheduled_for pour les emails planifiés
  - Index sur email_templates.type pour la recherche rapide
  - Index sur email_logs.email_queue_id pour les requêtes de suivi
*/

-- Créer la table email_queue
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  to_name text,
  from_email text NOT NULL DEFAULT 'noreply@fegesport.org',
  from_name text NOT NULL DEFAULT 'FEGESPORT',
  reply_to text,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  template_type text,
  template_data jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  priority integer NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  error_message text,
  sent_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  variables jsonb DEFAULT '[]'::jsonb,
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_queue_id uuid REFERENCES email_queue(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('queued', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Créer les indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_queue_id ON email_logs(email_queue_id);

-- Activer RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Créer les policies pour email_queue
CREATE POLICY "Admins can manage email queue"
  ON email_queue FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('emmanuelfob@gmail.com', 'admin@fegesport.org')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('emmanuelfob@gmail.com', 'admin@fegesport.org')
    )
  );

-- Créer les policies pour email_templates
CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('emmanuelfob@gmail.com', 'admin@fegesport.org')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('emmanuelfob@gmail.com', 'admin@fegesport.org')
    )
  );

-- Créer les policies pour email_logs
CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('emmanuelfob@gmail.com', 'admin@fegesport.org')
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les triggers pour updated_at
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

-- Fonction pour ajouter un log automatiquement lors de la création d'un email
CREATE OR REPLACE FUNCTION log_email_queue()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_logs (email_queue_id, event_type, event_data)
  VALUES (NEW.id, 'queued', jsonb_build_object('status', NEW.status, 'priority', NEW.priority));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_email_queue_trigger ON email_queue;
CREATE TRIGGER log_email_queue_trigger
  AFTER INSERT ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION log_email_queue();

-- Fonction pour logger les changements de statut
CREATE OR REPLACE FUNCTION log_email_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO email_logs (email_queue_id, event_type, event_data)
    VALUES (
      NEW.id,
      NEW.status::text,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'attempts', NEW.attempts,
        'error_message', NEW.error_message
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_email_status_change_trigger ON email_queue;
CREATE TRIGGER log_email_status_change_trigger
  AFTER UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION log_email_status_change();

-- Insérer les templates d'emails par défaut
INSERT INTO email_templates (name, type, subject, html_content, text_content, variables, language)
VALUES 
  (
    'Confirmation de contact',
    'contact_confirmation',
    'Votre message a bien été reçu - FEGESPORT',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background-color: #1a1a2e; padding: 20px; text-align: center;"><h1 style="color: #fff; margin: 0;">FEGESPORT</h1></div><div style="padding: 30px 20px;"><h2 style="color: #1a1a2e;">Bonjour {{name}},</h2><p style="color: #333; line-height: 1.6;">Nous avons bien reçu votre message concernant : <strong>{{subject}}</strong></p><p style="color: #333; line-height: 1.6;">Notre équipe vous répondra dans les plus brefs délais.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"><p style="margin: 0; color: #666; font-size: 14px;"><strong>Votre message :</strong></p><p style="margin: 10px 0 0 0; color: #333;">{{message}}</p></div><p style="color: #333; line-height: 1.6;">Merci de votre intérêt pour la FEGESPORT.</p><p style="color: #333; line-height: 1.6;">Cordialement,<br><strong>L''équipe FEGESPORT</strong></p></div><div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;"><p>Fédération Guinéenne d''Esport</p><p>Email: contact@fegesport.org</p></div></body></html>',
    'Bonjour {{name}},\n\nNous avons bien reçu votre message concernant : {{subject}}\n\nNotre équipe vous répondra dans les plus brefs délais.\n\nVotre message :\n{{message}}\n\nMerci de votre intérêt pour la FEGESPORT.\n\nCordialement,\nL''équipe FEGESPORT',
    '["name", "subject", "message"]'::jsonb,
    'fr'
  ),
  (
    'Notification interne de contact',
    'contact_notification',
    'Nouveau message de contact - {{name}}',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background-color: #1a1a2e; padding: 20px; text-align: center;"><h1 style="color: #fff; margin: 0;">FEGESPORT - Notification</h1></div><div style="padding: 30px 20px;"><h2 style="color: #1a1a2e;">Nouveau message de contact</h2><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"><p style="margin: 5px 0; color: #333;"><strong>Nom :</strong> {{name}}</p><p style="margin: 5px 0; color: #333;"><strong>Email :</strong> {{email}}</p><p style="margin: 5px 0; color: #333;"><strong>Sujet :</strong> {{subject}}</p><p style="margin: 10px 0 5px 0; color: #333;"><strong>Message :</strong></p><p style="margin: 0; color: #333; white-space: pre-wrap;">{{message}}</p></div></div></body></html>',
    'Nouveau message de contact\n\nNom : {{name}}\nEmail : {{email}}\nSujet : {{subject}}\n\nMessage :\n{{message}}',
    '["name", "email", "subject", "message"]'::jsonb,
    'fr'
  ),
  (
    'Confirmation d''adhésion',
    'membership_confirmation',
    'Bienvenue à la FEGESPORT - Confirmation d''adhésion',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background-color: #1a1a2e; padding: 20px; text-align: center;"><h1 style="color: #fff; margin: 0;">FEGESPORT</h1></div><div style="padding: 30px 20px;"><h2 style="color: #1a1a2e;">Bienvenue {{name}} !</h2><p style="color: #333; line-height: 1.6;">Nous sommes ravis de vous accueillir au sein de la Fédération Guinéenne d''Esport.</p><div style="background-color: #f0f8ff; padding: 20px; border-left: 4px solid #1a1a2e; margin: 20px 0;"><p style="margin: 5px 0; color: #333;"><strong>Type d''adhésion :</strong> {{membershipType}}</p><p style="margin: 5px 0; color: #333;"><strong>Numéro de membre :</strong> {{memberNumber}}</p></div><p style="color: #333; line-height: 1.6;">Votre adhésion vous donne accès à :</p><ul style="color: #333; line-height: 1.8;"><li>Tous les événements et compétitions de la FEGESPORT</li><li>Notre réseau de joueurs et clubs</li><li>Les ressources et formations</li><li>Le support de notre équipe</li></ul><p style="color: #333; line-height: 1.6;">Bienvenue dans la communauté esport guinéenne !</p><p style="color: #333; line-height: 1.6;">Cordialement,<br><strong>L''équipe FEGESPORT</strong></p></div><div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;"><p>Fédération Guinéenne d''Esport</p><p>Email: contact@fegesport.org</p></div></body></html>',
    'Bienvenue {{name}} !\n\nNous sommes ravis de vous accueillir au sein de la Fédération Guinéenne d''Esport.\n\nType d''adhésion : {{membershipType}}\nNuméro de membre : {{memberNumber}}\n\nVotre adhésion vous donne accès à :\n- Tous les événements et compétitions de la FEGESPORT\n- Notre réseau de joueurs et clubs\n- Les ressources et formations\n- Le support de notre équipe\n\nBienvenue dans la communauté esport guinéenne !\n\nCordialement,\nL''équipe FEGESPORT',
    '["name", "membershipType", "memberNumber"]'::jsonb,
    'fr'
  )
ON CONFLICT (type) DO NOTHING;