/*
  # Fix Contact Messages Public Insert

  ## Description
  Permet aux utilisateurs publics (anonymes et authentifiés) de soumettre
  des messages de contact via le formulaire public du site.

  ## Problème
  La migration de sécurité 20260110023739 a supprimé toutes les politiques
  d'insertion pour contact_messages, empêchant ainsi le formulaire de contact
  public de fonctionner.

  ## Solution
  - Ajoute une politique sécurisée pour permettre les insertions publiques
  - Valide le format de l'email
  - Valide la longueur minimale des champs obligatoires
  - Les lectures/modifications restent réservées aux admins uniquement

  ## Sécurité
  - RLS activé sur la table contact_messages
  - Validation du format email côté base de données
  - Lecture/modification réservées aux admins
  - Insertion publique limitée aux champs autorisés
*/

-- Créer une politique sécurisée pour les insertions publiques de messages de contact
CREATE POLICY "Public can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Validation: email doit avoir un format valide
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    -- Validation: name doit contenir au moins 2 caractères
    AND length(trim(name)) >= 2
    -- Validation: subject doit contenir au moins 3 caractères
    AND length(trim(subject)) >= 3
    -- Validation: message doit contenir au moins 10 caractères
    AND length(trim(message)) >= 10
  );

-- Ajouter un commentaire pour documenter la sécurité
COMMENT ON POLICY "Public can submit contact messages" ON contact_messages IS 
'Permet aux utilisateurs publics de soumettre des messages de contact avec validation des champs. 
Lecture et modification réservées aux admins uniquement.';
