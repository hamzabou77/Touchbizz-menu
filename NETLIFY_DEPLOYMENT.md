# Guide de Déploiement et Test sur Netlify - TouchBizz Menu

Ce guide explique pas à pas comment tester et déployer **TouchBizz Menu** sur **Netlify** tout en conservant l'architecture MySQL et la configuration de production Hostinger intacte.

---

## 1. Paramètres de Déploiement Netlify (Netlify UI)

Lors de la connexion de votre dépôt Git sur [Netlify](https://app.netlify.com) :

| Paramètre | Valeur |
| :--- | :--- |
| **Base directory** | *(Laisser vide / racine du projet)* |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Functions directory** | `netlify/functions` *(détecté automatiquement via `netlify.toml`)* |

Le fichier `netlify.toml` inclus à la racine configure automatiquement ces valeurs ainsi que la réécriture SPA et le routage des appels API.

---

## 2. Variables d'Environnement sur Netlify

Dans Netlify : **Site configuration** > **Environment variables** > **Add a variable** :

| Variable | Exemple / Valeur recommandée | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `sql123.main-hosting.eu` ou IP de votre serveur MySQL | L'hôte ou l'adresse IP distante de votre base MySQL (Hostinger ou cloud). |
| `DB_PORT` | `3306` | Port standard MySQL. |
| `DB_USER` | `u123456789_touchbizz` | Utilisateur MySQL avec permissions complètes sur la base. |
| `DB_PASSWORD` | `VOTRE_MOT_DE_PASSE_MYSQL` | Mot de passe de l'utilisateur MySQL. |
| `DB_NAME` | `u123456789_touchbizz_db` | Nom de la base de données MySQL. |
| `JWT_SECRET` | `une_cle_secrete_longue_et_aleatoire_256bit` | Clé pour signer les tokens JWT d'authentification. |
| `STRIPE_SECRET_KEY` | `sk_test_...` *(Optionnel)* | Clé secrète Stripe pour les abonnements SaaS. |

> ⚠️ **Important pour Hostinger MySQL distant** :
> Pour que les fonctions serverless de Netlify puissent interroger votre base MySQL Hostinger, activez l'accès distant dans votre hPanel Hostinger :
> **hPanel** > **Bases de données** > **MySQL Distant (Remote MySQL)** > Ajouter l'IP `%` (ou `0.0.0.0/0`) pour autoriser les requêtes entrantes de test.

---

## 3. Architecture Netlify & Fonctionnement Serverless

- **Frontend SPA** : Compilé par Vite dans `dist/`. La règle de redirection SPA dans `netlify.toml` et `public/_redirects` assure que les URL comme `/dashboard`, `/r/nom-du-restaurant`, ou `/login` ne renvoient jamais d'erreur 404 lors d'un rafraîchissement.
- **Backend API Serverless** : Situé dans `netlify/functions/api.ts`. Il encapsule notre routeur Express via `serverless-http` sans aucune modification de la logique métier.
- **Gestion des Connexions MySQL** : Le pool de connexions MySQL réutilise les sockets existants avec `context.callbackWaitsForEmptyEventLoop = false` pour des temps de réponse instantanés (~20ms).
- **Upload d'Images** : Compatible à la fois avec le disque local persistant d'Hostinger (`/uploads/`) et le système serverless de Netlify (conversion automatique en Data URI haute définition stockée en `MEDIUMTEXT` dans MySQL).

---

## 4. Test et Vérification du Flux Utilisateur sur Netlify

Une fois le déploiement Netlify terminé :

1. **Vérifier l'état de l'API** :
   Accédez à `https://<votre-site>.netlify.app/api/health`
   Vous devez obtenir : `{"status":"ok","database":"connected"}`.

2. **Création d'un compte & Connexion** :
   - Ouvrez `https://<votre-site>.netlify.app/register`
   - Créez un compte administrateur restaurant et connectez-vous.

3. **Gestion du restaurant & Menus** :
   - Créez un restaurant (nom, slug, description).
   - Ajoutez des catégories (Entrées, Plats, Desserts).
   - Ajoutez des articles avec photos et prix.
   - Publiez le restaurant.

4. **Accès Public au Menu (sans authentification)** :
   - Ouvrez dans un onglet privé l'URL publique : `https://<votre-site>.netlify.app/r/<votre-slug>`
   - Vérifiez que le menu s'affiche sans connexion, avec les catégories, photos, prix, devises, et sans aucun contrôle d'administration visible.

---

## 5. Préservation du Déploiement Hostinger

Le setup Hostinger reste **100% intact et opérationnel** :
- `server.js` à la racine reste le point d'entrée pour le Node.js Application Manager d'Hostinger.
- `schema.sql` reste la référence pour la création et la gestion des tables MySQL.
- Le dossier `/uploads` continue d'être utilisé pour le stockage direct sur le disque Hostinger.
- `HOSTINGER_DEPLOYMENT.md` reste disponible pour la mise en production finale.
