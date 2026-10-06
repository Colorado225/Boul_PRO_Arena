# Configuration Neon du dépôt

Projet : `curly-rice-23821974`  
Branche cible : `production`

## Fichiers

- `neon.ts` active Neon Auth et déclare la Function de prévisualisation `api`.
- `hello.ts` est le point d’entrée de la Neon Function.
- `apps/api/prisma.config.ts` reste propriétaire des migrations du schéma métier.

## Commandes reproductibles

```bash
npm run neon:plan
npm run neon:deploy
```

Le CLI `neon` est installé comme dépendance de développement du monorepo plutôt qu’en global, car l’environnement Arena n’autorise pas l’écriture dans `/usr/lib/node_modules`.

## Authentification de l’agent

Le déploiement non interactif nécessite `NEON_API_KEY`. Cette clé doit être injectée dans l’environnement et ne doit jamais être inscrite dans le dépôt ou dans une conversation. L’authentification navigateur du CLI redirige vers `127.0.0.1`, ce qui n’est pas accessible depuis le navigateur externe de l’utilisateur dans le sandbox Arena.

## Déploiement sécurisé via GitHub Actions

Le workflow `.github/workflows/neon-deploy.yml` évite de transmettre une clé à Arena :

1. créer une clé API dans la console Neon, limitée au projet lorsque possible ;
2. dans GitHub, ouvrir **Settings → Secrets and variables → Actions** ;
3. créer le secret `NEON_API_KEY` ;
4. ouvrir **Actions → Deploy Neon configuration → Run workflow**.

Le workflow utilise Node.js 22, valide les types et le build, puis exécute `neon deploy` sur le projet et la branche configurés.

## Attention architecturale

`auth: true` provisionne Neon Auth. Le produit possède actuellement une fondation de sessions applicatives Argon2/Prisma. Avant la clôture de P0.3, une seule autorité d’authentification sera conservée afin d’éviter deux sources de vérité. Neon Auth sera évalué comme autorité principale après déploiement sur la branche de test.
