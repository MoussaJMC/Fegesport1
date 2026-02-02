# Configuration du Domaine Email pour la Direction

Ce guide explique comment configurer des adresses email personnalisées avec votre domaine (ex: president@fegesport.org) pour les membres de la direction.

## Vue d'ensemble

Le système permet de configurer :
- **Email personnel** : L'adresse email personnelle du membre
- **Email officiel** : Une adresse avec votre domaine (ex: president@fegesport.org)
- **Transfert automatique** : Redirection des emails officiels vers l'email personnel
- **Signature personnalisée** : Signature HTML pour les communications officielles

## Configuration du domaine

### 1. Obtenir un domaine personnalisé

Si vous n'avez pas encore de domaine :
- Achetez un domaine sur [Namecheap](https://www.namecheap.com), [GoDaddy](https://www.godaddy.com) ou [OVH](https://www.ovh.com)
- Nous recommandons d'utiliser votre domaine principal (ex: fegesport.org)

### 2. Configurer les enregistrements DNS

Vous avez deux options pour gérer les emails :

#### Option A : Utiliser Resend (Recommandé)

Resend permet d'envoyer et de recevoir des emails professionnels.

1. **Connectez-vous à Resend**
   - Allez sur [resend.com/domains](https://resend.com/domains)
   - Cliquez sur "Add Domain"
   - Entrez votre domaine (ex: fegesport.org)

2. **Ajoutez les enregistrements DNS**
   Resend vous fournira des enregistrements DNS à ajouter :

   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:resend.com ~all

   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none

   Type: CNAME
   Name: resend._domainkey
   Value: resend._domainkey.resend.com
   ```

3. **Ajoutez les enregistrements chez votre fournisseur DNS**
   - Connectez-vous à votre fournisseur de domaine (Namecheap, GoDaddy, etc.)
   - Allez dans la section DNS/Zone DNS
   - Ajoutez les enregistrements fournis par Resend
   - Attendez 24-48h pour la propagation DNS

4. **Vérifiez le domaine**
   - Retournez sur Resend
   - Cliquez sur "Verify Domain"
   - Une fois vérifié, votre domaine est prêt

#### Option B : Utiliser un service d'email existant

Si vous utilisez déjà Gmail, Outlook ou un autre service :

1. **Créez les adresses email**
   - Créez les adresses dans votre service (ex: president@fegesport.org)
   - Notez les identifiants de connexion

2. **Configurez les transferts**
   - Dans votre service email, configurez le transfert automatique
   - Transférez vers l'email personnel du membre

### 3. Configuration dans l'interface d'administration

1. **Accédez à la page "Notre Direction"**
   - Connectez-vous à l'admin
   - Allez dans "Notre Direction"

2. **Modifiez un membre**
   - Cliquez sur le bouton "Modifier" d'un membre
   - Faites défiler jusqu'à "Configuration Email"

3. **Remplissez les champs**
   - **Email personnel** : L'adresse email personnelle (ex: mamadou@gmail.com)
   - **Email officiel** : L'adresse avec votre domaine (ex: president@fegesport.org)
   - **Transfert automatique** : Cochez pour activer le transfert
   - **Signature email** : Ajoutez une signature HTML personnalisée

4. **Exemple de signature HTML**
   ```html
   <div style="font-family: Arial, sans-serif; margin-top: 20px;">
     <strong>Mamadou Diallo</strong><br>
     Président<br>
     Fédération Guinéenne d'E-sport (FEGESPORT)<br>
     <a href="mailto:president@fegesport.org">president@fegesport.org</a><br>
     <a href="https://www.fegesport.org">www.fegesport.org</a>
   </div>
   ```

## Exemples de configuration par poste

### Président
- Email officiel : `president@fegesport.org`
- Email personnel : `mamadou@gmail.com`
- Transfert : Activé

### Secrétaire Général
- Email officiel : `secretaire@fegesport.org`
- Email personnel : `aissata@gmail.com`
- Transfert : Activé

### Directeur Technique
- Email officiel : `technique@fegesport.org`
- Email personnel : `ibrahima@gmail.com`
- Transfert : Activé

### Contact Général
- Email officiel : `contact@fegesport.org`
- Peut être redirigé vers plusieurs membres

## Gestion des emails entrants

### Avec Resend

Resend peut :
- Recevoir les emails
- Les transférer automatiquement vers les emails personnels
- Conserver une copie pour les archives

Configuration :
1. Allez dans [resend.com/webhooks](https://resend.com/webhooks)
2. Créez un webhook pour les emails entrants
3. Configurez les règles de transfert

### Sans Resend

Si vous utilisez un autre service :
1. Configurez les règles de transfert dans votre service email
2. Assurez-vous que les transferts sont actifs
3. Testez l'envoi d'un email de test

## Vérification et tests

### 1. Testez l'envoi d'emails

Envoyez un email de test à chaque adresse officielle :
```
À : president@fegesport.org
Objet : Test de configuration
Message : Ceci est un email de test
```

Vérifiez que :
- L'email arrive bien dans la boîte personnelle
- Il n'est pas marqué comme spam
- Le transfert fonctionne correctement

### 2. Vérifiez les enregistrements DNS

Utilisez des outils en ligne :
- [MXToolbox](https://mxtoolbox.com/SuperTool.aspx)
- [DNSChecker](https://dnschecker.org)

Vérifiez :
- Les enregistrements SPF
- Les enregistrements DKIM
- Les enregistrements DMARC

### 3. Testez la réputation du domaine

- [Mail-Tester](https://www.mail-tester.com) : Vérifiez le score de spam
- [Google Postmaster Tools](https://postmaster.google.com) : Suivez la réputation

## Bonnes pratiques

### Sécurité

1. **Utilisez DKIM et SPF**
   - Protège contre l'usurpation d'identité
   - Améliore la délivrabilité

2. **Activez DMARC**
   - Protège votre domaine
   - Recevez des rapports de sécurité

3. **Utilisez des mots de passe forts**
   - Pour les comptes email
   - Activez l'authentification 2FA si disponible

### Délivrabilité

1. **Réchauffez votre domaine**
   - Commencez par envoyer peu d'emails
   - Augmentez progressivement le volume

2. **Surveillez les bounces**
   - Nettoyez régulièrement votre liste
   - Supprimez les adresses invalides

3. **Évitez le spam**
   - N'achetez jamais de listes d'emails
   - Envoyez uniquement à des contacts qui ont consenti

### Maintenance

1. **Vérifiez régulièrement**
   - Les transferts fonctionnent
   - Les emails arrivent bien
   - Pas d'emails en spam

2. **Mettez à jour les informations**
   - Quand un membre change de poste
   - Quand un membre quitte l'organisation

3. **Conservez les archives**
   - Des communications importantes
   - Pour la traçabilité

## Dépannage

### Les emails n'arrivent pas

1. **Vérifiez les enregistrements DNS**
   - Utilisez MXToolbox
   - Attendez la propagation (24-48h)

2. **Vérifiez le dossier spam**
   - Dans l'email personnel
   - Marquez comme "Non spam"

3. **Testez avec un autre service**
   - Envoyez depuis Gmail, Outlook
   - Vérifiez les bounces

### Les emails arrivent en spam

1. **Vérifiez SPF/DKIM/DMARC**
   - Assurez-vous qu'ils sont configurés
   - Utilisez Mail-Tester pour diagnostiquer

2. **Améliorez le contenu**
   - Évitez les mots spam
   - Ajoutez plus de texte que d'images

3. **Réchauffez le domaine**
   - Commencez lentement
   - Augmentez progressivement

### Le transfert ne fonctionne pas

1. **Vérifiez la configuration**
   - Dans Resend ou votre service email
   - Testez avec un email de test

2. **Vérifiez les filtres**
   - Dans l'email personnel
   - Désactivez temporairement

3. **Contactez le support**
   - De Resend ou votre fournisseur
   - Ils peuvent diagnostiquer

## Support

Pour obtenir de l'aide :
- **Documentation Resend** : [resend.com/docs](https://resend.com/docs)
- **Support Resend** : [resend.com/support](https://resend.com/support)
- **Forum FEGESPORT** : Contactez l'équipe technique

## Ressources supplémentaires

- [Guide SPF Records](https://www.dmarcanalyzer.com/spf/)
- [Guide DKIM](https://www.dmarcanalyzer.com/dkim/)
- [Guide DMARC](https://dmarc.org/overview/)
- [Email Deliverability Guide](https://sendgrid.com/blog/email-deliverability-guide/)
