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

## Attention architecturale

`auth: true` provisionne Neon Auth. Le produit possède actuellement une fondation de sessions applicatives Argon2/Prisma. Avant la clôture de P0.3, une seule autorité d’authentification sera conservée afin d’éviter deux sources de vérité. Neon Auth sera évalué comme autorité principale après déploiement sur la branche de test.
