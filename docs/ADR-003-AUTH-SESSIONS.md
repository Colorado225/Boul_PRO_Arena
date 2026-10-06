# ADR-003 — Authentification par session opaque

- **Statut :** accepté
- **Date :** 2026-10-06

## Décision
L’application utilise une session opaque plutôt qu’un JWT longue durée dans le navigateur.

1. Le mot de passe est haché avec Argon2.
2. Après validation, le serveur génère 32 octets aléatoires.
3. Seul le SHA-256 du jeton est stocké dans Neon.
4. Le jeton brut est envoyé dans un cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production.
5. La session expire après 30 jours et peut être révoquée immédiatement.
6. Le tenant est dérivé de la session serveur, jamais d’un en-tête choisi librement par le client.

## Pourquoi
Une session opaque permet la révocation immédiate, limite l’exposition des permissions obsolètes et convient aux opérations sensibles de caisse et de finance. Le navigateur n’a jamais accès au jeton depuis JavaScript.

## Récupération de compte
Un jeton aléatoire à usage unique est valable 30 minutes. Seul son hash est enregistré. Une réinitialisation réussie révoque toutes les sessions actives. L’adaptateur d’envoi email/WhatsApp sera branché dans un incrément ultérieur ; le jeton de développement n’est jamais retourné en production.

## Mesures complémentaires

- réponses de connexion non distinctives pour limiter l’énumération ;
- vérification Argon2 factice lorsqu’un compte n’existe pas ;
- limitation de débit globale et renforcée sur connexion/récupération ;
- validation stricte et rejet des champs inconnus ;
- audit des connexions réussies ;
- proxy Next.js pour conserver une origine navigateur unique.

## À compléter avant clôture P0.3

- tests d’intégration sur Neon de test ;
- adaptateur de notification pour la récupération ;
- protection CSRF explicite pour les opérations sensibles ;
- écran de récupération et contrôle de route côté web ;
- politique de rotation et nettoyage des sessions expirées.
