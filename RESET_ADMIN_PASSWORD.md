# Réinitialisation du mot de passe administrateur

## Problème
Le compte admin@fegesport.org ne peut plus se connecter car les nouvelles exigences de mot de passe nécessitent :
- Minimum 12 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Au moins un caractère spécial

## Solution : Réinitialiser via Supabase Dashboard

### Étape 1 : Accéder au Dashboard Supabase
1. Allez sur https://supabase.com/dashboard
2. Connectez-vous avec votre compte Supabase
3. Sélectionnez votre projet FEGESPORT

### Étape 2 : Réinitialiser le mot de passe
1. Dans le menu de gauche, cliquez sur **Authentication**
2. Cliquez sur **Users**
3. Trouvez l'utilisateur `admin@fegesport.org`
4. Cliquez sur les trois points (...) à droite de l'utilisateur
5. Sélectionnez **Reset Password**
6. Choisissez **Send Password Reset Email** OU **Set New Password**

### Option A : Reset par email
- Un email sera envoyé à admin@fegesport.org
- Cliquez sur le lien dans l'email
- Créez un nouveau mot de passe respectant les critères

### Option B : Définir directement un nouveau mot de passe
- Entrez un nouveau mot de passe fort, par exemple :
  - `AdminFegesport2026!`
  - `Fegesport@Admin2026`
  - `SportGuinee@2026!`
- Le mot de passe doit respecter les critères de sécurité

### Étape 3 : Tester la connexion
1. Allez sur votre site : https://fegesport224.org/admin/login
2. Connectez-vous avec :
   - Email : `admin@fegesport.org`
   - Mot de passe : le nouveau mot de passe que vous avez défini

## Alternative : Utilisation de SQL (Pour développeurs)

Si vous avez accès à la console SQL Supabase, vous pouvez réinitialiser le mot de passe directement :

```sql
-- ATTENTION : Remplacez 'VotreNouveauMotDePasse123!' par votre mot de passe fort
UPDATE auth.users
SET encrypted_password = crypt('VotreNouveauMotDePasse123!', gen_salt('bf'))
WHERE email = 'admin@fegesport.org';
```

## Exemple de mots de passe valides

Voici des exemples de mots de passe qui respectent les critères :
- `AdminFegesport2026!`
- `Fegesport@Admin2026#`
- `Guinee$Sport2026Pass`
- `Esport@Guinea224!`

Chaque mot de passe doit avoir :
- ✅ Au moins 12 caractères
- ✅ Au moins une majuscule (A-Z)
- ✅ Au moins une minuscule (a-z)
- ✅ Au moins un chiffre (0-9)
- ✅ Au moins un caractère spécial (!@#$%^&*()_+-=)

## Note de sécurité

**NE PARTAGEZ JAMAIS** votre mot de passe administrateur. Conservez-le dans un gestionnaire de mots de passe sécurisé comme :
- 1Password
- LastPass
- Bitwarden
- KeePass

## Support

Si vous ne pouvez toujours pas accéder au compte après avoir réinitialisé le mot de passe, vérifiez :
1. Que vous utilisez bien l'email : `admin@fegesport.org`
2. Que votre nouveau mot de passe respecte tous les critères
3. Qu'il n'y a pas d'espace avant ou après l'email/mot de passe
4. Que votre connexion Internet est stable
