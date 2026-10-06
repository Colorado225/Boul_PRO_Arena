# ADR-002 — Neon PostgreSQL et stratégie de connexion

- **Statut :** accepté
- **Date :** 2026-10-06

## Décision
Neon fournit PostgreSQL pour tous les environnements. Prisma reste l’ORM et le propriétaire des migrations.

Deux URL distinctes sont obligatoires :

- `DATABASE_URL` : endpoint Neon **poolé**, utilisé par l’API ;
- `DIRECT_URL` : endpoint Neon **direct**, utilisé par `prisma migrate`.

Aucun secret n’est commité. `apps/api/.env.example` documente uniquement la forme des variables.

## Environnements et branches

- une branche Neon par environnement stable : `development`, `staging`, `production` ;
- une branche éphémère par pull request lorsque la CI sera installée ;
- aucune migration destructive automatique en production ;
- `prisma migrate deploy` est exécuté avant la nouvelle version de l’API ;
- sauvegarde et restauration testées avant une migration à risque.

## Pooling et transactions
Le trafic applicatif utilise le pooler Neon. Les migrations utilisent la connexion directe. Les cas d’usage critiques stock/caisse/finance restent dans des transactions courtes et ne dépendent jamais d’une session SQL persistante.

## Sécurité

- TLS obligatoire (`sslmode=require`) ;
- utilisateur d’exécution distinct de l’utilisateur administratif lorsque possible ;
- rotation des secrets ;
- aucune connexion directe depuis le navigateur ;
- isolation tenant dans tous les services et requêtes métier.
