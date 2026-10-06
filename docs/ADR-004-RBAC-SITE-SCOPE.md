# ADR-004 — RBAC et périmètre par boutique

- **Statut :** accepté
- **Date :** 2026-10-06

## Décision
L’autorisation combine trois contrôles obligatoires :

1. **tenant** : l’organisation provient exclusivement de la session authentifiée ;
2. **permission** : le rôle donne accès à une action métier explicite ;
3. **périmètre** : l’utilisateur est limité aux boutiques qui lui sont attribuées.

Une permission suit la forme `ressource:action`, par exemple `stock:adjust`, `sales:void` ou `users:invite`. La matrice de référence vit dans `@boul/domain` afin d’être testable sans NestJS ni Prisma.

## Rôles globaux et rôles limités

`SUPER_ADMIN`, `OWNER`, `DIRECTOR` et `GENERAL_MANAGER` ont une portée multi-sites. Les rôles opérationnels reçoivent au moins une entrée `UserSiteAccess`. Une permission ne contourne jamais la portée boutique.

## Délégation

Un utilisateur ne peut inviter qu’un rôle strictement inférieur au sien. `SUPER_ADMIN` n’est jamais attribuable depuis une organisation. Les invitations sont à usage unique, hachées, valables sept jours et auditées.

## Contraintes

- toute requête métier filtre `organizationId` côté serveur ;
- les boutiques d’une invitation sont validées contre le tenant et le périmètre de l’émetteur ;
- les contrôleurs utilisent `AuthGuard` puis `PermissionsGuard` ;
- les opérations sensibles produisent une entrée `AuditLog` ;
- aucune décision d’autorisation ne dépend d’un rôle envoyé par le navigateur.

## Évolution
La matrice codée couvre les rôles système du MVP. Les rôles personnalisés seront ajoutés ultérieurement sous forme de grants persistés, sans modifier les noms de permissions ni les guards.
