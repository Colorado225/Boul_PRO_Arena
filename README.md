# Boul. — Business OS pour boulangeries ivoiriennes

Prototype fonctionnel du socle produit défini dans `FLOWAGENT.md`.

## Lancer
```bash
npm install
npm run dev
```
Puis ouvrir `http://localhost:3000`.

## Inclus dans cette première livraison
- dashboard dirigeant responsive avec KPI reliés à un jeu de démonstration explicitement signalé ;
- caisse tactile fonctionnelle (panier, quantités, encaissement, persistance locale) ;
- vue stocks avec seuils, coûts et alertes ;
- vues production et rapports ;
- design system premium, mobile-first, composants réutilisables et Framer Motion ;
- PWA manifest ;
- architecture cible et schéma Prisma initial.

## Important
Les données visibles sont celles de **Boulangerie Excellence — Démo**. Elles servent au seed de démonstration demandé et ne sont pas présentées comme réelles. Le prochain incrément branche les écrans sur PostgreSQL/NestJS, ajoute l’authentification multi-tenant et remplace la persistance locale du POS par la file offline idempotente.

Voir `docs/ARCHITECTURE.md` pour les décisions techniques.
