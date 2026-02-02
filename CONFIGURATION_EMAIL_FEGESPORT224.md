# Configuration du système d'emails pour fegesport224.org

## Résumé des changements

Votre système d'emails a été configuré pour utiliser le domaine principal **fegesport224.org** au lieu d'un sous-domaine.

### Emails professionnels créés

Tous les membres de la direction ont maintenant un email professionnel @fegesport224.org :

| Poste | Email professionnel |
|-------|-------------------|
| Président | president@fegesport224.org |
| Secrétaire Général | secretaire@fegesport224.org |
| Responsable Juridique & Litiges | juridique@fegesport224.org |
| Responsable Section Féminine | feminin@fegesport224.org |
| Responsable Formation & Conférence | formation@fegesport224.org |
| Responsable Division eLeague | eleague@fegesport224.org |
| Responsable Events Esport & Tournois | events@fegesport224.org |
| Responsable Production | production@fegesport224.org |
| Conseiller Stratégique | strategie@fegesport224.org |
| Responsable Equipes Nationales | equipes-nationales@fegesport224.org |

### Email de contact général
- **contact@fegesport224.org**

---

## Configuration requise (étapes à suivre)

### 1. Création du compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit ou connectez-vous
3. Resend offre 3,000 emails/mois gratuits (largement suffisant pour démarrer)

### 2. Ajout du domaine dans Resend

1. Connectez-vous à [Resend Domains](https://resend.com/domains)
2. Cliquez sur **"Add Domain"**
3. Entrez exactement : `fegesport224.org` (sans www, sans sous-domaine)
4. Cliquez sur **"Add"**

### 3. Configuration DNS

Resend va vous donner des enregistrements DNS à ajouter. Voici les types d'enregistrements que vous devrez configurer :

#### Exemple d'enregistrements DNS (les valeurs exactes seront fournies par Resend)

| Type | Nom | Valeur | Priorité |
|------|-----|--------|----------|
| TXT | @ | `v=spf1 include:_spf.resend.com ~all` | - |
| TXT | resend._domainkey | `[Clé DKIM fournie par Resend]` | - |
| MX | @ | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| CNAME | resend | `verify.resend.com` | - |

#### Où ajouter ces enregistrements ?

Connectez-vous au panneau de contrôle de votre hébergeur DNS (là où vous avez configuré votre domaine pour le site web). Les enregistrements ci-dessus doivent être ajoutés **en plus** de vos enregistrements existants (A, CNAME pour le site web).

**Important :** N'EFFACEZ PAS vos enregistrements existants ! Ajoutez simplement les nouveaux.

### 4. Vérification du domaine

1. Après avoir ajouté les enregistrements DNS, retournez sur Resend
2. Cliquez sur **"Verify"** à côté de votre domaine
3. La vérification peut prendre de quelques minutes à 48 heures (généralement 10-30 minutes)
4. Rafraîchissez la page jusqu'à voir le statut **"Verified"**

### 5. Obtention de la clé API

1. Allez sur [Resend API Keys](https://resend.com/api-keys)
2. Cliquez sur **"Create API Key"**
3. Donnez-lui un nom : `FEGESPORT Production`
4. Sélectionnez les permissions : **"Sending access"**
5. Cliquez sur **"Add"**
6. **COPIEZ LA CLÉ IMMÉDIATEMENT** (elle ne sera plus visible après)
   - Format : `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 6. Configuration dans Supabase

1. Allez dans votre projet Supabase : [Projet FEGESPORT](https://supabase.com/dashboard/project/geozovninpeqsgtzwchu)
2. Allez dans **"Edge Functions"** → **"send-email"**
3. Cliquez sur **"Secrets"** ou **"Environment Variables"**
4. Ajoutez une nouvelle variable :
   - **Nom** : `RESEND_API_KEY`
   - **Valeur** : `re_xxxxxxxxxxxxxxxxxxxxxxxxxx` (la clé copiée depuis Resend)
5. Cliquez sur **"Save"**

---

## Test du système d'emails

Une fois la configuration terminée, vous pouvez tester le système :

1. Allez sur votre site : [fegesport224.org/contact](https://fegesport224.org/contact)
2. Remplissez le formulaire de contact
3. Soumettez le formulaire
4. Vous devriez recevoir :
   - Un email de confirmation à l'adresse que vous avez entrée
   - Une notification à l'email admin (emmanuelfob@gmail.com)

### Vérification dans Resend

1. Allez sur [Resend Logs](https://resend.com/logs)
2. Vous devriez voir les emails envoyés avec leur statut
3. Si un email échoue, les logs indiqueront la raison

---

## Dépannage

### Le domaine ne se vérifie pas

- Attendez jusqu'à 48h (propagation DNS)
- Vérifiez que vous avez bien ajouté TOUS les enregistrements DNS fournis par Resend
- Utilisez [DNS Checker](https://dnschecker.org) pour vérifier la propagation
- Vérifiez qu'il n'y a pas de fautes de frappe dans les valeurs

### Les emails ne s'envoient pas

1. Vérifiez que le domaine est bien vérifié dans Resend (statut "Verified")
2. Vérifiez que la clé API est correctement configurée dans Supabase
3. Vérifiez les logs dans Resend pour voir les erreurs
4. Vérifiez les logs de l'Edge Function dans Supabase

### Tester manuellement l'Edge Function

Vous pouvez tester directement l'Edge Function :

```bash
# Remplacez YOUR_ANON_KEY par votre clé anon de Supabase
curl -X POST https://geozovninpeqsgtzwchu.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "votre-email@example.com",
    "subject": "Test",
    "html": "<p>Ceci est un test</p>"
  }'
```

---

## Compatibilité avec le site web

**Excellente nouvelle !** Votre domaine `fegesport224.org` peut être utilisé simultanément pour :

- Le site web (enregistrements A/CNAME existants) ✅
- Les emails (nouveaux enregistrements MX/TXT/CNAME) ✅

Les deux systèmes sont complètement indépendants et compatibles. Vous n'avez rien à changer dans la configuration de votre site web.

---

## Prochaines améliorations possibles

Une fois le système fonctionnel, vous pourrez :

1. Créer des alias d'emails (ex: info@fegesport224.org → contact@fegesport224.org)
2. Configurer des règles de transfert automatique
3. Ajouter des templates d'emails supplémentaires
4. Mettre en place des emails automatiques pour les événements
5. Créer une newsletter automatisée

---

## Support

Si vous rencontrez des difficultés :

1. Consultez la [documentation Resend](https://resend.com/docs)
2. Vérifiez les logs dans votre dashboard Resend
3. Vérifiez les logs de l'Edge Function dans Supabase
4. Contactez le support Resend (très réactif)

---

**Fait le :** 2 février 2026
**Domaine configuré :** fegesport224.org
**Emails professionnels créés :** 10 membres + 1 email de contact
