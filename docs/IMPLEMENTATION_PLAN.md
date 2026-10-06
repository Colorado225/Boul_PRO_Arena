# Plan d’implémentation interactif — Boul. Business OS

> Source de vérité produit et technique. Mise à jour : 6 octobre 2026.

## 1. Stratégie retenue

Nous suivons des **tranches verticales livrables** plutôt qu’une construction horizontale par écrans. Chaque tranche traverse l’interface, l’API, la base de données, les permissions, l’audit et les tests. Cela réduit le risque de produire une belle maquette non exploitable.

Le **moteur de coût de revient** est le cœur du système. Toutefois, il dépend d’un petit socle fiable : tenant, unités, matières, achats, stock et recettes. Nous construisons donc le chemin de données minimal complet :

`achat → lot/stock → coût moyen → recette → production → coût unitaire → vente → marge → recommandation`

### Ajustements experts au fichier d’instructions

1. **Pas de microservices au départ.** Un monolithe modulaire Next.js + NestJS est plus rapide, testable et économique. Les frontières de modules permettront une extraction future.
2. **Ledger immuable pour stock et argent.** On corrige par contre-écriture, on ne réécrit pas l’histoire.
3. **Offline ciblé sur la caisse dès le MVP.** Le reste peut tolérer une connexion ; aucune vente ne peut être perdue.
4. **Comptabilité complète après la vérité opérationnelle.** Les exports OHADA restent configurables et doivent être validés par un expert local avant activation.
5. **IA après qualité des données.** D’abord des règles explicables et des prévisions statistiques ; l’IA générative ne décide jamais d’un montant comptable.
6. **Feature flags et configuration.** Fiscalité, moyens de paiement, unités, seuils et plans ne sont jamais codés en dur.

## 2. Règles de pilotage

Statuts : `À faire` → `En cours` → `Bloqué` → `Terminé`.

Une tranche est terminée uniquement si :

- parcours UI complet, responsive, accessible et sans faux bouton ;
- API documentée et validation serveur ;
- migration DB et isolation tenant ;
- RBAC et audit des actions sensibles ;
- états chargement, vide, erreur et reprise ;
- tests unitaires, intégration et E2E critiques ;
- métriques et logs utiles ;
- documentation et seed démontrable ;
- build vert, commit et push.

## 3. Roadmap de livraison

### Phase 0 — Fondations fiables
**Objectif :** rendre le dépôt déployable et sécurisé avant d’accumuler les fonctionnalités.

- [x] P0.1 Monorepo : `apps/web`, `apps/api`, packages `ui`, `domain`, `config`.
- [ ] P0.2 Neon PostgreSQL, Prisma, migration initiale et seed versionné — **en cours, connexion préparée**.
- [ ] P0.3 Authentification, sessions sécurisées, récupération de compte.
- [ ] P0.4 Organisation, boutique, utilisateurs, RBAC par ressource.
- [ ] P0.5 OpenAPI, gestion d’erreurs, logs structurés, health checks.
- [ ] P0.6 CI : lint, types, tests, build, audit dépendances.
- [ ] P0.7 Environnements dev/staging/prod, secrets et sauvegardes.

**Sortie :** un propriétaire crée une organisation et invite un gérant sans fuite inter-tenant.

### Phase 1 — Vérité du coût de revient
**Objectif :** répondre « combien me coûte réellement ce produit aujourd’hui ? »

#### Tranche 1A — Matières, unités et achats
- [ ] Catalogue matières et catégories.
- [ ] Moteur d’unités/conversions exactes.
- [ ] Fournisseurs, commande et réception.
- [ ] Lots, dates, historique des prix et mouvement de stock immuable.
- [ ] Coût moyen pondéré ; stratégie FIFO préparée.

#### Tranche 1B — Recette et coût théorique
- [ ] Recette versionnée, rendement et pertes prévues.
- [ ] Coûts matières, emballage, énergie, main-d’œuvre et frais indirects configurables.
- [ ] Calcul en `Decimal`, politique d’arrondi documentée.
- [ ] Prix minimum rentable et marge cible.
- [ ] Explication détaillée de chaque résultat.

#### Tranche 1C — Production et coût réel
- [ ] Ordre de production, consommation réelle, sortie produits finis.
- [ ] Écart théorique/réel et justification.
- [ ] Invendus, rebuts et valorisation des pertes.
- [ ] Recommandation simple : prix, recette ou achat à revoir.

**Sortie :** coût unitaire traçable d’une baguette et impact d’une hausse de farine.

### Phase 2 — Vente et caisse sans perte
**Objectif :** transformer chaque vente en marge fiable.

- [ ] Catalogue de vente, tarifs par boutique et promotions contrôlées.
- [ ] POS tactile, ouverture/fermeture, fond et comptage de caisse.
- [ ] Paiements espèces et abstraction Mobile Money.
- [ ] Vente offline dans IndexedDB, UUID/idempotence, reprise et conflits.
- [ ] Ticket, annulation par contre-opération et permission superviseur.
- [ ] Sortie de stock, coût de vente et marge au moment de la vente.

**Sortie :** vente complète online/offline, stock et marge cohérents.

### Phase 3 — Pilotage quotidien
**Objectif :** répondre aux sept questions stratégiques sur un seul écran.

- [ ] Dashboard par période et boutique.
- [ ] Ventes, dépenses, production, pertes, marge et trésorerie.
- [ ] Alertes explicables avec cause, impact et action.
- [ ] Rapport quotidien/hebdomadaire exportable.
- [ ] Mode simple et mode expert.
- [ ] Financial Health Score v1 fondé sur des règles documentées.

**Sortie :** le propriétaire sait ce qui s’est passé, pourquoi et quoi faire demain.

### Phase 4 — Finance et contrôle
**Objectif :** établir une rentabilité et une trésorerie défendables.

- [ ] Dépenses, centres de coûts et justificatifs.
- [ ] Créances, dettes fournisseurs et échéanciers.
- [ ] Budget, trésorerie, seuil de rentabilité et simulateur.
- [ ] P&L par produit, boutique et période.
- [ ] Journaux et exports compatibles OHADA, après validation métier.
- [ ] Espace expert-comptable et clôtures.

**Sortie :** résultat expliqué et export contrôlable par un professionnel.

### Phase 5 — Multi-boutiques et opérations
**Objectif :** piloter plusieurs sites sans perdre la traçabilité.

- [ ] Entrepôts, transferts à double validation et stocks en transit.
- [ ] Consolidation et comparaison des boutiques.
- [ ] Employés, présence et productivité.
- [ ] Équipements, maintenance et consommation d’énergie.
- [ ] Clients B2B, commandes, livraison et créances.

**Sortie :** vue consolidée et drill-down jusqu’au mouvement source.

### Phase 6 — Intelligence explicable
**Objectif :** prévenir plutôt que constater.

- [ ] Prévision de demande avec intervalles de confiance.
- [ ] Suggestion de production et commande fournisseur.
- [ ] Détection d’anomalies prix, pertes, caisse et consommation.
- [ ] Simulations hausse matière/prix/volume.
- [ ] Copilote avec preuves, permissions et journalisation.
- [ ] WhatsApp et notifications opt-in.

**Sortie :** recommandations mesurables, justifiées et acceptées manuellement.

### Phase 7 — Monétisation par la valeur
**Objectif :** convertir sans bloquer artificiellement l’activité.

- [ ] Plans Starter, Professional, Premium, Enterprise configurables.
- [ ] Trial avec mesure des économies réalisées.
- [ ] ROI calculator et paywall contextuel.
- [ ] Abstraction paiement et facturation.
- [ ] Usage analytics respectueux de la confidentialité.
- [ ] API, SSO et audit avancé Enterprise.

**Sortie :** abonnement lié à une valeur financière démontrée.

## 4. Séquence des six premiers incréments

| Incrément | Valeur utilisateur | Dépendances | Démonstration de sortie |
|---|---|---|---|
| I0 | Compte entreprise sécurisé | PostgreSQL, auth | création organisation + invitation |
| I1 | Connaître le prix réel des matières | unités, achats, stock | réception de 10 sacs, coût/kg calculé |
| I2 | Calculer le coût d’une baguette | recettes versionnées | coût et marge expliqués |
| I3 | Comparer théorie et réalité | production, pertes | écart de lot et cause |
| I4 | Encaisser sans perdre une vente | POS, offline | vente hors ligne synchronisée |
| I5 | Décider demain | agrégats, alertes | dashboard + recommandation chiffrée |

## 5. Risques à surveiller

- Réglementation ivoirienne incertaine : configuration + validation officielle, jamais d’invention.
- Précision financière : `Decimal`, tests de propriété et aucune opération monétaire en flottant.
- Scope : aucune phase suivante tant que le chemin de coût n’est pas démontrable.
- Offline : tests de coupure, doublon, ordre des événements et reprise après crash.
- Adoption : mesures de temps de tâche sur téléphone Android d’entrée de gamme.
- Données démo : toujours étiquetées ; aucune statistique statique présentée comme réelle.

## 6. Prochaine décision

Commencer par **P0.1 à P0.3**, puis livrer I1. Le prototype actuel sert de laboratoire UX ; ses composants seront progressivement reliés à l’API réelle plutôt que réécrits sans validation.
