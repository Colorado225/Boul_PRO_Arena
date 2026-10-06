# Déploiement et environnements

## Environnements

| Environnement | Branche Git | Branche Neon | Usage |
|---|---|---|---|
| development | locale | branche développeur | développement et seed démo |
| staging | `main` après CI | `staging` | migrations, intégration et recette |
| production | tag `v*` approuvé | `production` | trafic réel |

Ne jamais partager une base entre staging et production. Les données de production ne sont jamais recopiées vers development sans anonymisation.

## Composants

- `apps/web/Dockerfile` : image Next.js standalone, port 3000 ;
- `apps/api/Dockerfile` : image NestJS non-root, port 3001 ;
- Neon : PostgreSQL, connexions poolée et directe ;
- stockage S3-compatible : sauvegardes chiffrées et, plus tard, documents métier.

## Variables API

| Variable | Secret | Description |
|---|---:|---|
| `DATABASE_URL` | oui | endpoint Neon poolé avec `sslmode=require` |
| `DIRECT_URL` | oui | endpoint Neon direct pour migrations |
| `NODE_ENV` | non | `staging` ou `production` |
| `API_PORT` | non | port HTTP, 3001 par défaut |
| `LOG_LEVEL` | non | `info` en production |
| `OPENAPI_ENABLED` | non | désactiver publiquement si nécessaire |

## Variables Web

`API_INTERNAL_URL` est une URL serveur-vers-serveur. Le navigateur utilise toujours `/api/*`; il ne contacte jamais `localhost`.

## Ordre d’une livraison

1. CI verte sur le commit immuable.
2. Sauvegarde préalable si migration sensible.
3. `prisma migrate deploy` avec `DIRECT_URL`.
4. Déploiement API ; attente de `/api/v1/health/ready`.
5. Déploiement Web.
6. Smoke tests connexion, tenant, permissions et caisse.
7. Surveillance des erreurs et possibilité de rollback applicatif.

Une migration appliquée n’est pas annulée automatiquement par un rollback de code. Les changements destructifs utilisent la méthode expand/migrate/contract sur plusieurs versions.

## Images locales

```bash
docker build -f apps/api/Dockerfile -t boul-api .
docker build -f apps/web/Dockerfile -t boul-web .
```

Les conteneurs s’exécutent avec un utilisateur non-root et `tini` pour la gestion correcte des signaux.

## Sauvegardes

Neon fournit la restauration temporelle selon le plan souscrit. Une seconde couche indépendante est prévue chaque jour à 02:17 UTC :

1. `pg_dump` au format custom ;
2. contrôle avec `pg_restore --list` ;
3. chiffrement AES-256-CBC/PBKDF2 ;
4. checksum SHA-256 ;
5. envoi dans un stockage S3-compatible distinct.

Secrets GitHub requis :

- `BACKUP_DATABASE_URL` ;
- `BACKUP_ENCRYPTION_KEY` ;
- `BACKUP_S3_BUCKET` ;
- `BACKUP_S3_ENDPOINT` ;
- `BACKUP_S3_ACCESS_KEY_ID` ;
- `BACKUP_S3_SECRET_ACCESS_KEY`.

Rétention recommandée : 14 sauvegardes quotidiennes, 8 hebdomadaires et 12 mensuelles. La politique lifecycle est configurée côté bucket. Un test de restauration sur une branche Neon jetable doit être réalisé chaque mois et consigné.

## Procédure de restauration

1. créer une branche/base cible jetable ;
2. télécharger le dump et son checksum ;
3. vérifier `sha256sum -c` ;
4. définir `BACKUP_ENCRYPTION_KEY` et `RESTORE_DATABASE_URL` ;
5. exécuter `scripts/verify-backup.sh <dump.enc>` ;
6. lancer les tests de cohérence avant toute bascule.
