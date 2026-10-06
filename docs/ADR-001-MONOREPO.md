# ADR-001 — Monorepo et monolithe modulaire

- **Statut :** accepté
- **Date :** 2026-10-06

## Contexte
Le produit couvre POS, stock, coûts, finance et intelligence. Une séparation insuffisante crée un système couplé ; des microservices immédiats créeraient en revanche un coût d’exploitation disproportionné avant validation du marché.

## Décision
Utiliser un monorepo npm workspaces :

- `apps/web` : interface Next.js/PWA ;
- `apps/api` : API NestJS et propriétaire de la persistance ;
- `packages/domain` : contrats et règles métier sans dépendance framework ;
- `packages/ui` : composants visuels réutilisables ;
- `packages/config` : configuration TypeScript partagée.

L’API est un **monolithe modulaire**. Les modules communiquent par services publics et événements de domaine, pas par accès direct aux tables d’un autre module.

## Règles de dépendance

1. `domain` ne dépend d’aucun framework, ORM ou transport.
2. `ui` ne connaît ni API, ni Prisma, ni logique métier.
3. `web` consomme des contrats publics et ne touche jamais la base.
4. `api` orchestre les cas d’usage ; Prisma reste dans l’infrastructure.
5. Aucune importation profonde entre modules (`module/internal/*`).
6. `organizationId` est obligatoire dans tout cas d’usage métier.

## Conséquences
Le déploiement reste simple, les tests de bout en bout sont rapides et les frontières permettent d’extraire ultérieurement un service sans réécrire le domaine.
