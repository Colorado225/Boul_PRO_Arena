# ADR-005 — Contrat API et observabilité

- **Statut :** accepté
- **Date :** 2026-10-06

## Contrat d’erreur
Toutes les erreurs HTTP suivent un format inspiré de RFC 9457 (`application/problem+json`) avec `type`, `title`, `status`, `detail`, `instance`, `requestId` et `timestamp`. Les erreurs de validation ajoutent `errors`.

Les détails internes, requêtes SQL, traces et secrets ne sont jamais envoyés au client. Les erreurs Prisma connues sont traduites en conflits ou ressources introuvables.

## Corrélation et logs
Chaque requête reçoit un identifiant `x-request-id`, conservé lorsqu’un proxy en fournit un valide. Les logs Pino sont JSON en production et lisibles localement. Cookies, autorisations, mots de passe et jetons sont expurgés.

## Santé

- `/api/v1/health/live` : processus vivant, sans dépendance externe ;
- `/api/v1/health/ready` : prêt à recevoir du trafic, y compris Neon ;
- `/api/v1/health` : résumé pour le diagnostic.

Les plateformes de déploiement doivent utiliser `ready` pour la readiness et `live` pour la liveness.

## Documentation
OpenAPI est généré depuis le code et exposé sous `/api/docs`; le document JSON est disponible sous `/api/docs-json`. L’authentification de l’API est décrite comme un cookie HttpOnly `boul_session`.
