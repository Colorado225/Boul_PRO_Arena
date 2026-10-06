# Boul. — Business OS pour boulangeries ivoiriennes

Prototype fonctionnel du socle produit défini dans `FLOWAGENT.md`.

## Lancer
```bash
npm install
npm run dev
```
Puis ouvrir `http://localhost:3000`.

L’API NestJS peut être lancée séparément avec `npm run dev:api` et expose son contrôle de santé sur `http://localhost:3001/api/v1/health`.

## Structure du monorepo

```text
apps/web       Interface Next.js et PWA
apps/api       API NestJS et schéma de persistance
packages/domain  Contrats et règles métier sans framework
packages/ui      Composants réutilisables
packages/config  Configuration TypeScript partagée
```

Les règles de dépendance sont consignées dans `docs/ADR-001-MONOREPO.md`. La base cible est **Neon PostgreSQL** avec deux connexions séparées (poolée pour l’API, directe pour les migrations), documentées dans `docs/ADR-002-NEON-DATABASE.md`. La configuration Neon déclarative et la Function de prévisualisation se trouvent dans `neon.ts` et `hello.ts` (`docs/NEON_PROJECT_SETUP.md`).

## Inclus dans cette première livraison
- dashboard dirigeant responsive avec KPI reliés à un jeu de démonstration explicitement signalé ;
- caisse tactile fonctionnelle (panier, quantités, encaissement, persistance locale) ;
- vue stocks avec seuils, coûts et alertes ;
- vues production et rapports ;
- design system premium, mobile-first, composants réutilisables et Framer Motion ;
- PWA manifest ;
- architecture cible et schéma Prisma initial ;
- plan d’implémentation interactif avec phases, dépendances, statuts et progression persistante (`docs/IMPLEMENTATION_PLAN.md`) ;
- authentification par session opaque, cookies sécurisés, limitation de débit et écran `/connexion` ;
- RBAC métier, périmètres par boutique, invitations sécurisées et écran « Équipe & accès » ;
- OpenAPI, erreurs `problem+json`, logs structurés avec corrélation et contrôles live/ready ;
- CI GitHub : Prisma, lint, types, tests, builds, audit critique et mises à jour Dependabot ;
- images OCI Web/API, validation stricte des environnements et sauvegardes Neon chiffrées vers S3 ;
- interface matières/catégories reliée à l’API et moteur exact d’unités, y compris les emballages spécifiques (`1 sac de farine = 50 kg`).

## Important
Les données visibles sont celles de **Boulangerie Excellence — Démo**. Elles servent au seed de démonstration demandé et ne sont pas présentées comme réelles. Le prochain incrément branche les écrans sur PostgreSQL/NestJS, ajoute l’authentification multi-tenant et remplace la persistance locale du POS par la file offline idempotente.

Voir `docs/ARCHITECTURE.md` pour les décisions techniques.
