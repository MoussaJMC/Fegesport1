# Configuration des Variables d'Environnement pour les Emails

## Vue d'ensemble

Ce document explique comment configurer les variables d'environnement nécessaires pour le système d'envoi d'emails de FEGESPORT.

## Variables Requises

### 1. RESEND_API_KEY (Obligatoire)

**Description :** Clé API Resend pour envoyer des emails

**Où la trouver :**
1. Connectez-vous à [Resend Dashboard](https://resend.com/api-keys)
2. Cliquez sur "API Keys"
3. Créez une nouvelle clé ou copiez une clé existante
4. La clé ressemble à : `re_123abc456def789ghi012jkl345mno678`

**Comment la configurer dans Supabase :**

**Méthode 1 : Via l'interface Supabase**
1. Allez sur https://supabase.com/dashboard/project/geozovninpeqsgtzwchu/settings/functions
2. Cliquez sur "Edge Functions" dans le menu
3. Cliquez sur "Manage secrets"
4. Ajoutez un nouveau secret :
   - Nom : `RESEND_API_KEY`
   - Valeur : Votre clé API Resend
5. Sauvegardez

**Méthode 2 : Via Supabase CLI**
```bash
supabase secrets set RESEND_API_KEY=re_votre_cle_api_ici
```

### 2. Variables d'Environnement Automatiques

Ces variables sont automatiquement disponibles dans les Edge Functions :
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service Supabase

**Vous n'avez RIEN à configurer pour ces variables.**

## Configuration du Domaine d'Envoi

### Adresses Email Par Défaut

Le système utilise maintenant les adresses suivantes :

**Expéditeur par défaut :**
- Email : `noreply@contact.fegesport224.org`
- Nom : `FEGESPORT`

**Adresse de réponse :**
- Email : `contact@contact.fegesport224.org`

### Personnalisation

Pour utiliser d'autres adresses, vous pouvez les spécifier lors de l'envoi :

```typescript
await emailService.sendEmail({
  to: 'destinataire@example.com',
  from: 'info@contact.fegesport224.org',      // Adresse personnalisée
  fromName: 'Info FEGESPORT',        // Nom personnalisé
  replyTo: 'support@contact.fegesport224.org',  // Réponse personnalisée
  subject: 'Votre sujet',
  html: '<p>Votre contenu</p>'
});
```

## Vérification de la Configuration

### 1. Vérifier que la clé API est configurée

**Via l'interface admin :**
1. Allez sur `/admin/emails`
2. Cliquez sur "Traiter la file d'attente"
3. Si vous voyez une erreur "RESEND_API_KEY not configured", la clé n'est pas configurée

**Via les logs :**
1. Soumettez le formulaire de contact sur votre site
2. Vérifiez dans `/admin/emails` que l'email a le statut "sent" (pas "pending" ou "failed")

### 2. Vérifier que le domaine est configuré

**Dans Resend Dashboard :**
1. Allez sur https://resend.com/domains
2. Vérifiez que `contact.fegesport224.org` apparaît avec un statut "Verified" ✓
3. Si le statut est "Pending" ou "Failed", suivez les instructions DNS

**Test d'envoi :**
1. Allez sur votre site : `/contact`
2. Remplissez et soumettez le formulaire
3. Vérifiez votre boîte email
4. L'email doit provenir de `noreply@contact.fegesport224.org`

## Adresses Email Disponibles

Une fois le domaine vérifié, vous pouvez utiliser n'importe quelle adresse @contact.fegesport224.org :

### Adresses Recommandées

| Adresse | Usage | Configuré |
|---------|-------|-----------|
| `noreply@contact.fegesport224.org` | Emails automatiques sans réponse | ✅ |
| `contact@contact.fegesport224.org` | Contact général, réponses | ✅ |
| `info@contact.fegesport224.org` | Informations générales | ⬜ |
| `admin@contact.fegesport224.org` | Administration | ⬜ |
| `support@contact.fegesport224.org` | Support technique | ⬜ |
| `notification@contact.fegesport224.org` | Notifications système | ⬜ |
| `events@contact.fegesport224.org` | Événements et inscriptions | ⬜ |

**Note :** Ces adresses n'ont pas besoin d'exister comme vraies boîtes mail pour **envoyer** des emails. Cependant, si vous voulez **recevoir** des réponses, vous devez créer ces boîtes mail chez votre hébergeur.

## Configuration Avancée

### 1. Environnements Multiples

Si vous avez plusieurs environnements (développement, staging, production) :

**Développement :**
```bash
RESEND_API_KEY=re_cle_de_test
```
- Utilisez une clé de test Resend
- Les emails ne seront pas réellement envoyés

**Production :**
```bash
RESEND_API_KEY=re_cle_de_production
```
- Utilisez votre clé de production
- Les emails seront envoyés réellement

### 2. Limites de l'API Resend

**Plan Gratuit :**
- 100 emails/jour
- 3 000 emails/mois
- Parfait pour tester

**Plan Pro ($20/mois) :**
- 50 000 emails/mois
- Support prioritaire
- Analytics avancés

**Vérifier votre usage :**
1. Allez sur https://resend.com/usage
2. Surveillez votre consommation

### 3. Configuration de Sécurité

**Bonnes pratiques :**

1. **Ne jamais exposer la clé API côté client**
   - La clé doit rester dans les Edge Functions
   - Jamais dans le code frontend

2. **Utiliser des clés différentes par environnement**
   - Clé de test pour développement
   - Clé de production séparée

3. **Rotation régulière des clés**
   - Changez votre clé API tous les 6 mois
   - Créez une nouvelle clé avant de supprimer l'ancienne

4. **Surveillance des logs**
   - Vérifiez régulièrement `/admin/emails`
   - Surveillez les tentatives d'envoi échouées
   - Alertez en cas de pic anormal

## Dépannage

### ❌ Erreur : "RESEND_API_KEY not configured"

**Solution :**
1. Vérifiez que vous avez bien ajouté la variable dans Supabase
2. Attendez 1-2 minutes après l'ajout (propagation)
3. Redéployez l'Edge Function si nécessaire

### ❌ Erreur : "Domain not verified"

**Solution :**
1. Suivez le guide `CONFIGURATION_DOMAINE_EMAIL.md`
2. Vérifiez les enregistrements DNS
3. Attendez la propagation (jusqu'à 24h)

### ❌ Erreur : "Invalid API key"

**Solution :**
1. Vérifiez que vous avez copié la clé complète
2. Assurez-vous qu'il n'y a pas d'espaces avant/après
3. Vérifiez que la clé n'a pas été révoquée dans Resend

### ❌ Emails marqués comme spam

**Solution :**
1. Configurez SPF, DKIM, DMARC (voir guide domaine)
2. Ajoutez un lien de désinscription
3. Utilisez un score mail-tester.com
4. Évitez les mots-clés spam

## Monitoring et Statistiques

### Dans Resend Dashboard

Accédez aux statistiques :
1. https://resend.com/emails
2. Consultez :
   - Taux de livraison
   - Taux d'ouverture
   - Taux de clics
   - Rebonds et plaintes

### Dans l'Application

Accédez à `/admin/emails` pour :
- Nombre total d'emails
- Emails en attente
- Emails envoyés
- Emails en échec
- Détails de chaque email

## Support

### Documentation
- **Resend Docs** : https://resend.com/docs
- **API Reference** : https://resend.com/docs/api-reference/introduction
- **Status Page** : https://status.resend.com/

### Contact
- **Support Resend** : support@resend.com
- **Discord Resend** : https://resend.com/discord
- **Twitter Resend** : @resendlabs

### Équipe FEGESPORT
Pour toute question sur la configuration :
- Email : emmanuelfob@gmail.com
- Admin : `/admin/emails` pour les logs

---

**Dernière mise à jour :** Février 2026
**Version du système :** 1.0
