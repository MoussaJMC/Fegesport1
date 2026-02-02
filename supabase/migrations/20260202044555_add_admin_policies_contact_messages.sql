/*
  # Add Admin Policies for Contact Messages

  ## Description
  Ajoute les politiques RLS manquantes pour permettre aux administrateurs
  d'accéder aux messages de contact via l'interface d'administration.

  ## Problème
  Après la migration de sécurité qui a supprimé les politiques trop permissives,
  aucune politique n'a été créée pour permettre aux admins de lire, modifier
  et supprimer les messages de contact. Résultat : la page /admin/messages
  reste vide même si des messages existent dans la base de données.

  ## Solution
  - Ajoute une politique SELECT pour que les admins puissent lire tous les messages
  - Ajoute une politique UPDATE pour que les admins puissent modifier le statut
  - Ajoute une politique DELETE pour que les admins puissent supprimer les messages

  ## Sécurité
  - Utilise la fonction is_admin() pour vérifier les droits d'administration
  - Les utilisateurs non-admins ne peuvent toujours pas accéder aux messages
  - La politique d'insertion publique reste inchangée
*/

-- Politique SELECT : les admins peuvent lire tous les messages de contact
CREATE POLICY "Admins can read all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Politique UPDATE : les admins peuvent modifier les messages (ex: changer le statut)
CREATE POLICY "Admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Politique DELETE : les admins peuvent supprimer les messages
CREATE POLICY "Admins can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Ajouter des commentaires pour documenter la sécurité
COMMENT ON POLICY "Admins can read all contact messages" ON contact_messages IS 
'Permet aux administrateurs de consulter tous les messages de contact. 
Utilise is_admin() pour vérifier les droits.';

COMMENT ON POLICY "Admins can update contact messages" ON contact_messages IS 
'Permet aux administrateurs de modifier les messages (changement de statut, etc.). 
Utilise is_admin() pour vérifier les droits.';

COMMENT ON POLICY "Admins can delete contact messages" ON contact_messages IS 
'Permet aux administrateurs de supprimer les messages. 
Utilise is_admin() pour vérifier les droits.';
