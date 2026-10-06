# ADR-007 — Environnements, conteneurs et sauvegardes

- **Statut :** accepté
- **Date :** 2026-10-06

## Décision
Development, staging et production utilisent des branches Neon séparées. Les applications sont livrées sous forme d’images OCI reproductibles : Next.js standalone et NestJS non-root.

Les secrets restent dans le gestionnaire du fournisseur de déploiement ou GitHub Environments. Aucun secret n’est inclus à la construction des images. La configuration API est validée au démarrage et refuse une production sans TLS Neon.

## Sauvegarde
La restauration temporelle Neon constitue la première ligne. Un `pg_dump` quotidien chiffré vers un stockage S3-compatible indépendant constitue la seconde. L’intégrité est vérifiée avant l’envoi et une restauration jetable est testée mensuellement.

## Migration
`prisma migrate deploy` précède l’API. Les changements destructifs suivent expand/migrate/contract. Une sauvegarde est obligatoire avant toute migration marquée à risque.

## Portabilité
Aucun fournisseur d’exécution applicatif n’est imposé. Toute plateforme acceptant des conteneurs, HTTPS, secrets et health checks peut héberger le Web et l’API. Neon reste le fournisseur PostgreSQL décidé dans ADR-002.
