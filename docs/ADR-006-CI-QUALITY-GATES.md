# ADR-006 — CI et barrières de qualité

- **Statut :** accepté
- **Date :** 2026-10-06

## Décision
Chaque pull request et chaque push sur `main` exécute une CI reproductible sous Node.js 22 avec `npm ci`.

La fusion exige :

1. schéma Prisma valide et client générable ;
2. lint frontend, API et domaine ;
3. vérification TypeScript de tous les workspaces ;
4. tests unitaires ;
5. builds de production NestJS et Next.js ;
6. absence de vulnérabilité de production critique connue.

## Sécurité des dépendances
Dependabot vérifie npm chaque semaine et GitHub Actions chaque mois. Les vulnérabilités critiques bloquent la CI. Les niveaux inférieurs sont suivis et corrigés par lots afin d’éviter les mises à niveau forcées non testées.

## Secrets
La CI de qualité n’utilise aucun secret de production. Les URL PostgreSQL factices servent uniquement à la validation statique de Prisma. Le déploiement Neon reste dans un workflow manuel séparé avec `NEON_API_KEY`.

## Protection recommandée
La branche `main` doit exiger le job **Lint, types, tests and build**, interdire les pushes forcés et demander une pull request pour les changements de production.
