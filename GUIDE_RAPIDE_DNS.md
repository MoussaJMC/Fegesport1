# Guide Rapide : Configurer les DNS pour fegesport.org

## Étapes Rapides

### 1️⃣ Obtenir les Enregistrements de Resend

1. Allez sur https://resend.com/domains
2. Cliquez sur **"Add Domain"**
3. Entrez : `fegesport.org`
4. Cliquez sur **"Add"**
5. **Copiez tous les enregistrements affichés**

---

### 2️⃣ Ajouter les Enregistrements DNS

Allez chez votre hébergeur de domaine et ajoutez ces enregistrements :

#### 📋 Enregistrement 1 : SPF (TXT)

```
Type: TXT
Nom: @
Valeur: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

**Copier-coller la valeur :**
```
v=spf1 include:_spf.resend.com ~all
```

---

#### 📋 Enregistrement 2 : DMARC (TXT)

```
Type: TXT
Nom: _dmarc
Valeur: v=DMARC1; p=none; rua=mailto:postmaster@fegesport.org
TTL: 3600
```

**Copier-coller la valeur :**
```
v=DMARC1; p=none; rua=mailto:postmaster@fegesport.org
```

---

#### 📋 Enregistrement 3 : Vérification Resend (TXT)

```
Type: TXT
Nom: _resend
Valeur: [COPIER depuis Resend Dashboard]
TTL: 3600
```

**Important :** Cette valeur est unique pour votre compte. Copiez-la exactement depuis Resend.

---

#### 📋 Enregistrements 4, 5, 6 : DKIM (CNAME)

**DKIM 1 :**
```
Type: CNAME
Nom: resend._domainkey
Valeur: resend._domainkey.resend.com
TTL: 3600
```

**DKIM 2 :**
```
Type: CNAME
Nom: resend2._domainkey
Valeur: resend2._domainkey.resend.com
TTL: 3600
```

**DKIM 3 :**
```
Type: CNAME
Nom: resend3._domainkey
Valeur: resend3._domainkey.resend.com
TTL: 3600
```

---

### 3️⃣ Vérifier la Configuration

**Attendre :** 15 minutes à 4 heures

**Vérifier sur :**
- https://dnschecker.org/ (entrez `fegesport.org`)
- https://resend.com/domains (cliquez sur "Verify")

---

### 4️⃣ Tester l'Envoi

Une fois **"Verified" ✓** dans Resend :

1. Allez sur votre site : `/contact`
2. Remplissez le formulaire
3. Soumettez
4. Vérifiez votre email

L'email doit provenir de **noreply@fegesport.org** ✅

---

## Checklist Rapide

- [ ] Domaine ajouté dans Resend
- [ ] 1 TXT pour SPF ajouté
- [ ] 1 TXT pour DMARC ajouté
- [ ] 1 TXT pour vérification Resend ajouté
- [ ] 3 CNAME pour DKIM ajoutés
- [ ] Attente propagation (15 min - 4h)
- [ ] Domaine vérifié dans Resend ✓
- [ ] Test d'envoi réussi ✓

---

## Configuration selon l'Hébergeur

### 🟦 OVH

1. Zone DNS → Ajouter une entrée
2. Choisir le type (TXT ou CNAME)
3. Coller les valeurs
4. TTL : 3600

### 🟧 GoDaddy

1. DNS Management
2. Add Record
3. Type = TXT ou CNAME
4. Coller les valeurs

### 🟨 Namecheap

1. Advanced DNS
2. Add New Record
3. Choisir Type
4. Coller les valeurs

### 🟩 Cloudflare

1. DNS Records
2. Add Record
3. Type = TXT ou CNAME
4. **Important :** Désactiver le proxy (nuage gris) pour les CNAME DKIM

### 🟪 Autre Hébergeur

Cherchez "DNS" ou "Zone DNS" dans votre panneau d'administration.

---

## Valeurs à Copier Rapidement

### Pour SPF (TXT) :
```
v=spf1 include:_spf.resend.com ~all
```

### Pour DMARC (TXT) :
```
v=DMARC1; p=none; rua=mailto:postmaster@fegesport.org
```

### Pour DKIM 1 (CNAME) :
```
resend._domainkey.resend.com
```

### Pour DKIM 2 (CNAME) :
```
resend2._domainkey.resend.com
```

### Pour DKIM 3 (CNAME) :
```
resend3._domainkey.resend.com
```

---

## En Cas de Problème

### ⚠️ "Domain not verified" après 4h

1. Vérifiez avec https://dnschecker.org/
2. Entrez `_dmarc.fegesport.org` et `resend._domainkey.fegesport.org`
3. Si les enregistrements n'apparaissent pas, vérifiez votre configuration DNS

### ⚠️ Enregistrements non trouvés

- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
- Vérifiez qu'il n'y a pas de points finaux (ex: `.com.` au lieu de `.com`)
- Pour Cloudflare : désactivez le proxy (nuage gris) pour les DKIM

### ⚠️ Conflits SPF

Si vous avez déjà un SPF, combinez-les :

**Ancien :**
```
v=spf1 include:_spf.google.com ~all
```

**Nouveau (combiné) :**
```
v=spf1 include:_spf.resend.com include:_spf.google.com ~all
```

---

## Support Rapide

**Vérifier les DNS :** https://dnschecker.org/
**Status Resend :** https://status.resend.com/
**Support Resend :** https://resend.com/support

---

**Temps total estimé :** 10 minutes de configuration + 1-4h d'attente DNS
