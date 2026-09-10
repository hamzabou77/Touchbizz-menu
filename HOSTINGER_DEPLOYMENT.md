# Guide de Déploiement Hostinger & MySQL — TouchBizz Menu

Ce guide détaille étape par étape comment déployer votre application **TouchBizz Menu** sur votre hébergement **Hostinger** (cPanel / hPanel Node.js ou VPS Hostinger) avec une base de données **MySQL native**.

---

## 1. Création de la Base de Données MySQL sur Hostinger

1. Connectez-vous à votre tableau de bord **Hostinger (hPanel)**.
2. Rendez-vous dans la section **Bases de données** > **Bases de données MySQL**.
3. Créez une nouvelle base de données et son utilisateur :
   - **Nom de la base de données** : ex. `u123456789_touchbizz`
   - **Nom d'utilisateur MySQL** : ex. `u123456789_user`
   - **Mot de passe** : Choisissez un mot de passe sécurisé et notez-le.
4. Cliquez sur **Créer**.

---

## 2. Importation du Schéma MySQL (`schema.sql`)

1. Dans la même section sur hPanel, repérez votre nouvelle base et cliquez sur **Accéder à phpMyAdmin**.
2. Dans phpMyAdmin, sélectionnez votre base dans le volet de gauche.
3. Cliquez sur l'onglet supérieur **Importer**.
4. Cliquez sur **Choisir un fichier** et sélectionnez le fichier `schema.sql` situé à la racine de ce projet.
5. Cliquez sur **Exécuter** en bas de page.
   - Les 4 tables (`users`, `restaurants`, `categories`, `menu_items`) et les données d'initialisation seront créées automatiquement avec les clés primaires, clés étrangères et index de performance.

---

## 3. Configuration des Variables d'Environnement

Créez ou éditez le fichier `.env` sur votre serveur avec vos identifiants Hostinger :

```env
# Connexion MySQL Hostinger (hPanel > Bases de données MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_user
DB_PASSWORD=VotreMotDePasseMySQL
DB_NAME=u123456789_touchbizz

# Clé secrète JWT pour la signature des sessions sécurisées
JWT_SECRET=touchbizz_hostinger_secret_key_change_moi_en_production

# Port du serveur Express (ou géré par l'application manager Hostinger)
PORT=3000
NODE_ENV=production
```

> **Astuce Hostinger** : Si Node.js tourne sur le même serveur que MySQL, `DB_HOST=localhost` ou `DB_HOST=127.0.0.1` fonctionne directement. Si vous utilisez l'accès MySQL distant d'Hostinger, utilisez l'adresse IP de votre serveur MySQL fournie dans hPanel.

---

## 4. Installation et Compilation du Projet

Sur votre machine de développement ou via SSH sur Hostinger :

```bash
# 1. Installer les dépendances
npm install

# 2. Compiler l'application front-end et le serveur Express
npm run build
```

La commande `npm run build` produit :
- Le dossier `dist/` contenant les assets React compilés.
- Le fichier `dist/server.cjs`, un serveur Node.js unique, optimisé et autonome.

---

## 5. Déploiement sur Hostinger

### Option A : Hébergement Node.js Hostinger (hPanel)
1. Dans hPanel, rendez-vous dans **Avancé** > **Gestionnaire Node.js** (ou **Node.js App**).
2. Cliquez sur **Créer une application Node.js** :
   - **Version de Node.js** : Sélectionnez **Node.js 18.x** ou **20.x**.
   - **Mode d'application** : **Production**.
   - **Racine de l'application** : `/home/u123456789/domains/votre-domaine.com/public_html` (ou dossier dédié).
   - **Fichier de démarrage** : `server.js` ou `dist/server.cjs`.
   - **URL de l'application** : Sélectionnez votre nom de domaine ou sous-domaine.
3. Configurez les variables d'environnement dans l'onglet **Variables d'environnement** de l'interface Hostinger (ou dans le fichier `.env`).
4. Cliquez sur **Enregistrer** puis **Démarrer l'application**.

### Option B : VPS Hostinger (Ubuntu / Debian avec PM2 et Nginx)
Si vous disposez d'un VPS Hostinger :
```bash
# Installer PM2 pour gérer le processus en continu
npm install -g pm2

# Démarrer le serveur TouchBizz
pm2 start dist/server.cjs --name "touchbizz"

# Configurer le redémarrage automatique au reboot du VPS
pm2 save
pm2 startup
```

---

## 6. Permissions des Téléchargements d'Images (`uploads/`)

Les photos des plats et les logos uploadés par les restaurateurs sont enregistrés directement sur le serveur dans le dossier `uploads/`. Assurez-vous des permissions d'écriture :

```bash
mkdir -p uploads
chmod 755 uploads
```

---

## 7. Vérification du Bon Fonctionnement

1. **Vérification API & Base de données** :
   Accédez à `https://votre-domaine.com/api/health`
   Vous recevrez un JSON confirmant :
   ```json
   {
     "status": "ok",
     "engine": "TouchBizz Hostinger API",
     "database": {
       "isConfigured": true,
       "isConnected": true,
       "host": "localhost",
       "database": "u123456789_touchbizz"
     }
   }
   ```
2. **Connexion Restaurateur** : `https://votre-domaine.com/login`
3. **Tableau de Bord** : `https://votre-domaine.com/dashboard`
4. **Menu Client Public** : `https://votre-domaine.com/r/votre-slug` (accessible directement sans connexion)
