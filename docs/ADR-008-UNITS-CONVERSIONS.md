# ADR-008 — Unités et conversions exactes

- **Statut :** accepté
- **Date :** 2026-10-06

## Décision
Les quantités ne sont jamais converties avec les nombres flottants JavaScript. Le domaine utilise `decimal.js`; PostgreSQL utilise `Decimal(24,9)` pour les facteurs et `Decimal(18,6)` pour les quantités.

Les unités appartiennent à une organisation et possèdent une dimension : masse, volume, comptage ou emballage. Les conversions physiques peuvent être générales (`1 kg = 1000 g`). Les conversions d’emballage sont spécifiques à une matière (`1 sac de farine T55 = 50 kg`).

## Algorithme
Le moteur construit un graphe bidirectionnel et recherche un chemin de conversion. Chaque facteur inverse est calculé en décimal. Les règles spécifiques à une matière complètent les règles générales. Une conversion entre dimensions physiques incompatibles est rejetée.

## Transition du schéma
Le champ historique `RawMaterial.baseUnit` est conservé pendant la migration. Les nouveaux enregistrements utilisent `baseUnitId` et `purchaseUnitId`. Il sera supprimé uniquement après backfill et vérification en production selon expand/migrate/contract.

## Invariants

- facteur strictement positif ;
- unité de base non `PACKAGE` ;
- unités, catégories et matières du même tenant ;
- référence matière unique par organisation ;
- précision d’affichage configurable par unité ;
- aucune règle fiscale ou métier locale codée dans le moteur.
