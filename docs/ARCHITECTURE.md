# Architecture — Boul. Business OS

## Décision produit
Le MVP répond d’abord aux 7 questions centrales : dépensé, produit, vendu, perdu, coûté, gagné, prochaine action. Le moteur de coût est le noyau transversal et non un module isolé.

## Architecture cible
- **Web/PWA** : Next.js, React, TypeScript, Tailwind, composants inspirés shadcn/ReUI, Framer Motion.
- **API métier** : NestJS modulaire, REST/OpenAPI, événements de domaine.
- **Données** : PostgreSQL + Prisma, montants en entiers XOF ou Decimal pour les ratios.
- **Asynchrone** : Redis + BullMQ (rapports, imports, notifications, synchronisation).
- **Fichiers** : stockage S3 compatible.
- **Sécurité** : session sécurisée, RBAC par tenant/site/module, journal d’audit, rate limit.

## Modules et dépendances
`organization → site → user/RBAC`

`purchase → inventory movement → weighted cost → recipe → production → finished stock → sale → margin → cash → dashboard`

Les écritures de stock sont immuables. Les agrégats sont reconstruisibles. Toute table métier porte `organizationId`; l’isolation tenant est validée dans le service et la couche de données.

## MVP (phase 1)
1. Tenant, authentification, utilisateurs et rôles.
2. Produits, matières, fournisseurs, unités/conversions.
3. Stock et mouvements, achats/réceptions.
4. POS, ventes et clôture de caisse.
5. Dashboard utile et audit.

## Workflows critiques
### Vente
Ouverture caisse → panier → validation → paiement → vente immuable → sortie produits finis → mouvement de caisse → KPI.

### Achat
Commande → réception partielle/totale → lot et contrôle → entrée stock → coût moyen → dette/paiement → audit.

### Offline
Commande locale avec UUID et horodatage → file d’attente IndexedDB → synchronisation idempotente → arbitrage serveur. Une vente validée n’est jamais écrasée.

## Design system
- Couleurs : encre `#172219`, vert valeur `#B7EF5B`, fond farine `#F5F3EC`, orange alerte.
- Rayon 12–24 px, contours fins, ombres discrètes.
- Texte métier simple; termes experts disponibles dans un mode dédié.
- Animations 120–220 ms, jamais décoratives au détriment de la vitesse.

## Roadmap
Phases du cahier des charges conservées : Core → Cost control → Finance → Multi-branch → Intelligence → Premium. Chaque livraison respecte UI, API, DB, permission, tests, erreurs, chargements, vide, responsive, accessibilité et documentation.
