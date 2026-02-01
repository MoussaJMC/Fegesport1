# Guide du Système de Gestion des Emails FEGESPORT

## Vue d'ensemble

Le système de gestion des emails de FEGESPORT est une solution complète qui gère automatiquement l'envoi, le suivi et le traitement des emails de la plateforme. Il comprend :

- Une file d'attente d'emails avec gestion des priorités
- Des templates d'emails personnalisables
- Un système de logs complet
- Une interface d'administration
- Un service d'envoi via Resend API (optionnel)

## Architecture

### 1. Base de données

Trois tables principales :

#### **email_queue**
Stocke tous les emails à envoyer avec leur statut
- Statuts possibles : `pending`, `sending`, `sent`, `failed`
- Priorités : 1 (haute), 2 (normale), 3 (basse)
- Système de tentatives avec maximum de 3 essais

#### **email_templates**
Templates d'emails réutilisables avec support multilingue
- Templates par défaut : confirmation de contact, notification interne, confirmation d'adhésion
- Variables dynamiques (ex: `{{name}}`, `{{subject}}`, etc.)
- Support HTML et texte brut

#### **email_logs**
Historique complet de tous les événements liés aux emails
- Types d'événements : queued, sending, sent, delivered, opened, clicked, bounced, failed

### 2. Edge Function

**send-email** : Gère l'envoi effectif des emails

**Fonctionnalités :**
- POST : Ajoute un email à la file d'attente et l'envoie
- GET avec `?action=process` : Traite tous les emails en attente

**Modes de fonctionnement :**
- Avec `RESEND_API_KEY` : Envoie via Resend API
- Sans clé : Stocke uniquement dans la file d'attente

### 3. Service Client

**emailService** : Interface JavaScript pour interagir avec le système

**Méthodes principales :**
```typescript
// Envoyer un email personnalisé
emailService.sendEmail(options)

// Envoyer via un template
emailService.sendEmailFromTemplate(templateType, email, name, data)

// Méthodes spécifiques
emailService.sendContactConfirmation(data)
emailService.sendContactNotification(data)
emailService.sendMembershipConfirmation(data)

// Gestion de la file d'attente
emailService.getEmailQueue(status?)
emailService.processEmailQueue()
emailService.getEmailLogs(emailId)
```

## Configuration

### Étape 1 : Configuration de Resend (Recommandé)

Pour envoyer réellement les emails, vous devez configurer Resend :

1. Créer un compte sur [Resend.com](https://resend.com)
2. Obtenir votre clé API
3. Ajouter la variable d'environnement dans Supabase :
   ```bash
   RESEND_API_KEY=re_votre_cle_api
   ```

**Important :** Sans la clé Resend, les emails seront uniquement mis en file d'attente mais pas envoyés.

### Étape 2 : Vérification du domaine

Pour envoyer des emails depuis votre propre domaine :

1. Dans Resend, ajoutez votre domaine (ex: fegesport.org)
2. Configurez les enregistrements DNS (SPF, DKIM, DMARC)
3. Attendez la vérification du domaine
4. Utilisez `noreply@votredomaine.com` comme expéditeur

### Étape 3 : Personnalisation des templates

Les templates sont stockés dans la table `email_templates`. Pour les modifier :

1. Connectez-vous à l'interface d'administration
2. Allez dans "Emails" > Templates (à venir)
3. Modifiez le contenu HTML et texte
4. Utilisez les variables entre `{{` et `}}` pour les données dynamiques

## Utilisation

### 1. Envoi automatique

Les emails sont envoyés automatiquement dans ces situations :

**Formulaire de contact :**
- Email de confirmation à l'utilisateur
- Email de notification à l'administrateur

**Inscription de membre :**
- Email de bienvenue avec informations d'adhésion
- Envoyé après inscription réussie (joueurs) ou après paiement (clubs/partenaires)

### 2. Envoi manuel depuis l'administration

Via la page `/admin/emails` :

1. Visualiser la file d'attente des emails
2. Filtrer par statut (en attente, envoyés, échecs)
3. Traiter manuellement la file d'attente
4. Consulter les détails et logs de chaque email

### 3. Envoi programmatique

```typescript
import { emailService } from './lib/emailService';

// Exemple : Envoyer un email personnalisé
await emailService.sendEmail({
  to: 'utilisateur@example.com',
  toName: 'Jean Dupont',
  subject: 'Bienvenue',
  html: '<h1>Bienvenue!</h1><p>Merci de votre inscription.</p>',
  priority: 1
});

// Exemple : Utiliser un template
await emailService.sendEmailFromTemplate(
  'contact_confirmation',
  'user@example.com',
  'Jean Dupont',
  {
    name: 'Jean Dupont',
    subject: 'Demande d\'information',
    message: 'Je souhaite en savoir plus...'
  }
);
```

## Monitoring et suivi

### Page d'administration

La page `/admin/emails` offre :

**Statistiques :**
- Total d'emails
- Emails en attente
- Emails envoyés
- Emails en échec

**Gestion :**
- Filtrage par statut
- Actualisation en temps réel
- Traitement manuel de la file d'attente
- Vue détaillée de chaque email avec aperçu HTML

**Détails d'un email :**
- Statut et progression
- Informations expéditeur/destinataire
- Sujet et priorité
- Nombre de tentatives
- Messages d'erreur (si échec)
- Aperçu du contenu HTML

### Logs automatiques

Chaque changement d'état génère automatiquement un log :
- Ajout à la file d'attente
- Début d'envoi
- Envoi réussi
- Échec avec message d'erreur

## Traitement de la file d'attente

### Automatique (Recommandé)

Configurer un Cron Job pour traiter régulièrement la file :

```bash
# Toutes les 5 minutes
*/5 * * * * curl -X GET "https://votre-projet.supabase.co/functions/v1/send-email?action=process"
```

### Manuel

Via l'interface d'administration :
1. Aller sur `/admin/emails`
2. Cliquer sur "Traiter la file d'attente"

Via API :
```typescript
await emailService.processEmailQueue();
```

## Templates disponibles

### 1. Confirmation de contact
**Type :** `contact_confirmation`

Variables :
- `{{name}}` : Nom complet de l'utilisateur
- `{{subject}}` : Sujet du message
- `{{message}}` : Contenu du message

### 2. Notification interne de contact
**Type :** `contact_notification`

Variables :
- `{{name}}` : Nom de l'expéditeur
- `{{email}}` : Email de l'expéditeur
- `{{subject}}` : Sujet du message
- `{{message}}` : Contenu du message

### 3. Confirmation d'adhésion
**Type :** `membership_confirmation`

Variables :
- `{{name}}` : Nom du nouveau membre
- `{{membershipType}}` : Type d'adhésion
- `{{memberNumber}}` : Numéro de membre

## Sécurité

### Row Level Security (RLS)

Toutes les tables email ont RLS activé :
- Seuls les administrateurs peuvent gérer les emails
- Vérification basée sur l'email : `emmanuelfob@gmail.com` ou `admin@fegesport.org`

### Validation des données

- Tous les emails sont validés côté client et serveur
- Protection contre les injections XSS et SQL
- Rate limiting sur les formulaires

### Gestion des secrets

- Les clés API sont stockées comme variables d'environnement Supabase
- Jamais exposées côté client
- Accessible uniquement via Edge Functions

## Dépannage

### Les emails ne sont pas envoyés

1. Vérifier que `RESEND_API_KEY` est configurée
2. Vérifier les logs dans la table `email_logs`
3. Consulter la page `/admin/emails` pour voir les erreurs
4. Vérifier le statut du domaine dans Resend

### Emails en échec

1. Consulter le message d'erreur dans les détails de l'email
2. Vérifier que l'adresse email destinataire est valide
3. S'assurer que le domaine expéditeur est vérifié
4. Les emails peuvent avoir jusqu'à 3 tentatives automatiques

### Performance

Pour les gros volumes :
1. Ajuster les priorités des emails
2. Augmenter la fréquence du traitement de la file
3. Surveiller les métriques dans Resend Dashboard

## Support

Pour toute question ou problème :
- Consulter les logs dans `/admin/emails`
- Vérifier la documentation Resend : https://resend.com/docs
- Contacter l'équipe technique FEGESPORT

---

**Version :** 1.0
**Dernière mise à jour :** Février 2026
**Auteur :** Équipe technique FEGESPORT
