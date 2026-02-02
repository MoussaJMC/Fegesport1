# Configuration du Domaine pour l'Envoi d'Emails - FEGESPORT

## Objectif

Configurer le domaine **fegesport.org** pour envoyer des emails professionnels depuis votre propre domaine (ex: `noreply@fegesport.org`, `contact@fegesport.org`) au lieu d'utiliser un domaine Resend par défaut.

## Étape 1 : Ajouter votre domaine dans Resend

### 1.1 Accéder à la console Resend

1. Connectez-vous à [Resend Dashboard](https://resend.com/domains)
2. Cliquez sur **"Domains"** dans le menu de gauche
3. Cliquez sur le bouton **"Add Domain"**

### 1.2 Ajouter le domaine

1. Entrez votre domaine : `fegesport.org`
2. Choisissez la région : **Europe (recommandé pour la Guinée)**
3. Cliquez sur **"Add"**

Resend va générer automatiquement les enregistrements DNS nécessaires.

## Étape 2 : Configurer les Enregistrements DNS

Vous devez ajouter **3 types d'enregistrements DNS** dans la configuration de votre domaine. Ces enregistrements permettent de vérifier que vous êtes bien le propriétaire du domaine et d'authentifier vos emails.

### Où configurer les DNS ?

Selon votre hébergeur de domaine :
- **GoDaddy** : DNS Management
- **Namecheap** : Advanced DNS
- **OVH** : Zone DNS
- **Cloudflare** : DNS Records
- **Autre** : Cherchez "DNS" ou "Zone DNS" dans votre panneau d'administration

### 2.1 Enregistrement SPF (TXT)

**Objectif :** Autorise Resend à envoyer des emails pour votre domaine

```
Type: TXT
Nom/Host: @  (ou fegesport.org)
Valeur: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (ou Auto)
```

**Important :** Si vous avez déjà un enregistrement SPF, vous devez le modifier pour inclure Resend :
```
v=spf1 include:_spf.resend.com include:autresservices.com ~all
```

### 2.2 Enregistrements DKIM (CNAME)

**Objectif :** Signature cryptographique pour authentifier vos emails

Resend vous fournira 3 enregistrements CNAME similaires à ceux-ci :

**Enregistrement 1 :**
```
Type: CNAME
Nom/Host: resend._domainkey
Valeur: resend._domainkey.resend.com
TTL: 3600
```

**Enregistrement 2 :**
```
Type: CNAME
Nom/Host: resend2._domainkey
Valeur: resend2._domainkey.resend.com
TTL: 3600
```

**Enregistrement 3 :**
```
Type: CNAME
Nom/Host: resend3._domainkey
Valeur: resend3._domainkey.resend.com
TTL: 3600
```

**Note :** Les valeurs exactes seront affichées dans votre tableau de bord Resend. Copiez-les exactement.

### 2.3 Enregistrement DMARC (TXT)

**Objectif :** Politique de gestion des emails non authentifiés

```
Type: TXT
Nom/Host: _dmarc
Valeur: v=DMARC1; p=none; rua=mailto:postmaster@fegesport.org
TTL: 3600
```

**Explication de la politique :**
- `p=none` : Mode surveillance (recommandé au début)
- `p=quarantine` : Marquer comme spam (après validation)
- `p=reject` : Rejeter complètement (mode strict)

### 2.4 Enregistrement de Vérification (TXT)

Resend vous fournira un enregistrement de vérification unique :

```
Type: TXT
Nom/Host: _resend
Valeur: resend-verify=XXXXX-XXXXX-XXXXX (valeur unique fournie par Resend)
TTL: 3600
```

## Étape 3 : Exemple de Configuration Complète

Voici un tableau récapitulatif de tous les enregistrements à ajouter :

| Type  | Nom/Host              | Valeur                                          | Priorité | TTL  |
|-------|----------------------|------------------------------------------------|----------|------|
| TXT   | @                    | v=spf1 include:_spf.resend.com ~all            | -        | 3600 |
| TXT   | _dmarc               | v=DMARC1; p=none; rua=mailto:postmaster@...   | -        | 3600 |
| TXT   | _resend              | resend-verify=XXXXX-XXXXX-XXXXX                | -        | 3600 |
| CNAME | resend._domainkey    | resend._domainkey.resend.com                   | -        | 3600 |
| CNAME | resend2._domainkey   | resend2._domainkey.resend.com                  | -        | 3600 |
| CNAME | resend3._domainkey   | resend3._domainkey.resend.com                  | -        | 3600 |

## Étape 4 : Attendre la Propagation DNS

### Délai de propagation

- **Minimum** : 15-30 minutes
- **Moyen** : 1-4 heures
- **Maximum** : 24-48 heures

### Vérifier la propagation

Utilisez ces outils gratuits :
1. **DNS Checker** : https://dnschecker.org/
2. **What's My DNS** : https://whatsmydns.net/
3. **MXToolbox** : https://mxtoolbox.com/SuperTool.aspx

Entrez votre domaine et vérifiez que les enregistrements apparaissent dans plusieurs régions du monde.

## Étape 5 : Vérifier le Domaine dans Resend

1. Retournez sur [Resend Dashboard](https://resend.com/domains)
2. Cliquez sur votre domaine `fegesport.org`
3. Cliquez sur **"Verify Domain"**
4. Si tout est configuré correctement, vous verrez un statut **"Verified" ✓**

**Si la vérification échoue :**
- Attendez encore un peu (propagation DNS)
- Vérifiez que vous avez copié exactement les valeurs
- Assurez-vous qu'il n'y a pas d'espaces avant/après les valeurs
- Vérifiez que vous n'avez pas de points finaux inutiles

## Étape 6 : Tester l'Envoi

Une fois le domaine vérifié, testez l'envoi :

### 6.1 Test depuis Resend Dashboard

1. Dans Resend, allez dans **"Send Test Email"**
2. Utilisez `noreply@fegesport.org` comme expéditeur
3. Envoyez à votre adresse email personnelle
4. Vérifiez la réception

### 6.2 Test depuis votre application

1. Allez sur votre site : `/contact`
2. Remplissez le formulaire de contact
3. Soumettez le formulaire
4. Vérifiez que vous recevez l'email de confirmation

## Étape 7 : Configuration des Adresses Email

Vous pouvez maintenant utiliser plusieurs adresses :

- `noreply@fegesport.org` : Emails automatiques (confirmations, notifications)
- `contact@fegesport.org` : Contact général
- `info@fegesport.org` : Informations
- `admin@fegesport.org` : Administration
- `support@fegesport.org` : Support technique

**Note :** Ces adresses n'ont pas besoin d'exister réellement pour **envoyer** des emails, mais vous devriez créer des boîtes mail pour recevoir les réponses si vous utilisez `reply_to`.

## Problèmes Courants et Solutions

### ❌ Erreur : "Domain not verified"

**Solution :**
- Attendre plus longtemps (propagation DNS)
- Vérifier les enregistrements DNS avec dnschecker.org
- S'assurer qu'il n'y a pas de guillemets dans les valeurs

### ❌ Erreur : "SPF record conflict"

**Solution :**
- Vous avez probablement déjà un enregistrement SPF
- Modifiez l'enregistrement existant pour inclure Resend :
  ```
  v=spf1 include:_spf.resend.com include:autre.com ~all
  ```

### ❌ Emails marqués comme spam

**Solution :**
- Vérifiez que DKIM et SPF sont correctement configurés
- Passez DMARC de `p=none` à `p=quarantine` après quelques jours
- Ajoutez un lien de désinscription dans vos emails
- Évitez les mots "spam" dans le contenu

### ❌ Erreur : "Invalid DKIM"

**Solution :**
- Vérifiez que vous avez bien copié les 3 enregistrements CNAME
- Assurez-vous qu'il n'y a pas de point final après .com
- Attendez la propagation DNS complète

## Aide Supplémentaire

### Support Resend
- Documentation : https://resend.com/docs/dashboard/domains/introduction
- Support : https://resend.com/support

### Outils de Diagnostic
- **Mail Tester** : https://www.mail-tester.com/ (score de délivrabilité)
- **DMARC Analyzer** : https://dmarcian.com/dmarc-inspector/
- **SPF Record Check** : https://mxtoolbox.com/spf.aspx

### Vérification de Sécurité

Une fois configuré, testez votre configuration :

1. **Score Email** : https://www.mail-tester.com/
   - Envoyez un email à l'adresse fournie
   - Obtenez un score (visez 10/10)

2. **DMARC Check** : https://dmarcian.com/
   - Vérifiez que votre politique DMARC est correcte

3. **Blacklist Check** : https://mxtoolbox.com/blacklists.aspx
   - Assurez-vous que votre domaine n'est pas sur liste noire

## Récapitulatif des Actions

- [ ] Ajouter le domaine dans Resend Dashboard
- [ ] Copier les enregistrements DNS fournis par Resend
- [ ] Ajouter les enregistrements DNS chez votre hébergeur :
  - [ ] 1 enregistrement TXT pour SPF
  - [ ] 1 enregistrement TXT pour DMARC
  - [ ] 1 enregistrement TXT pour la vérification
  - [ ] 3 enregistrements CNAME pour DKIM
- [ ] Attendre la propagation DNS (1-4 heures)
- [ ] Vérifier le domaine dans Resend Dashboard
- [ ] Tester l'envoi d'un email
- [ ] Vérifier le score sur mail-tester.com
- [ ] Configurer les adresses email dans l'application

---

**Note Importante :** Conservez une copie de tous vos enregistrements DNS avant modification. En cas de problème, vous pourrez restaurer la configuration précédente.

**Support :** Pour toute assistance, contactez votre hébergeur de domaine ou le support Resend.

**Date de création :** Février 2026
