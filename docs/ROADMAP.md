# AirWeight - Feuille de Route (Roadmap)

## 🎯 Vision à Long Terme

Devenir la plateforme de référence mondiale pour la gestion intelligente des bagages aériens, en transformant chaque kilo non utilisé en valeur économique et environnementale.

---

## 📅 Roadmap Détaillée

### ✅ Phase 0 : Foundation (COMPLÉTÉ - Janvier 2026)

**Objectif** : Établir les fondations techniques du projet

- ✅ Architecture backend FastAPI
- ✅ Frontend Next.js avec landing page premium
- ✅ Modèles de base de données PostgreSQL
- ✅ Système d'authentification JWT
- ✅ Wallet virtuel de base
- ✅ Gestion des vols et transactions
- ✅ Système d'abonnements (Free, Premium, Family)
- ✅ Documentation complète
- ✅ Configuration Docker
- ✅ Repository GitHub

**Statut** : ✅ **100% Complété**

---

### 🚧 Phase 1 : MVP (Février - Mars 2026)

**Objectif** : Créer un produit minimum viable fonctionnel

#### Frontend (4 semaines) - 90% Complété ✅

- [x] Page Login/Register avec validation
- [x] Dashboard utilisateur
  - [x] Vue d'ensemble du wallet
  - [x] Statistiques personnalisées
  - [x] Graphiques de progression
- [x] Page Gestion des Vols
  - [x] Liste des vols avec filtres et pagination
  - [x] Ajout manuel de vol
  - [x] Détails de vol complets
- [x] Page Historique Transactions
- [x] Page Profil Utilisateur
- [x] Page Abonnements
- [x] Pages Forgot/Reset Password
- [x] Design responsive mobile
- [ ] Intégration complète OCR dans le frontend (upload + scan)
- [ ] Composants réutilisables (Navbar, Sidebar, Modal)
- [ ] Pages d'erreur personnalisées (404, 500)

#### Backend (3 semaines) - 95% Complété ✅

- [x] Intégration OCR (Google Vision API)
  - [x] Endpoint upload image (`POST /flights/scan-ticket`)
  - [x] Parser de tickets de bagages
  - [x] Extraction automatique des données
  - [x] Support Tesseract fallback
- [x] Email notifications
  - [x] Confirmation d'inscription
  - [x] Notification de crédit
  - [x] Alertes importantes
  - [x] Service SMTP complet
  - [x] Templates HTML professionnels
- [x] Password reset flow
  - [x] `POST /auth/forgot-password`
  - [x] `POST /auth/reset-password`
  - [x] Tokens sécurisés avec expiration
- [x] Email verification
  - [x] `POST /auth/verify-email`
  - [x] `POST /auth/resend-verification`
- [x] Intégration Stripe complète
  - [x] Service Stripe
  - [x] Endpoints de paiement
  - [x] Webhooks
- [x] Amadeus API Integration
  - [x] `POST /flights/lookup-allowance`
  - [x] Recherche de franchises bagages
- [ ] Rate limiting implémenté
- [ ] Système de notifications in-app

#### Tests (2 semaines) - 0% Complété

- [ ] Tests unitaires backend (>80% coverage)
- [ ] Tests d'intégration API
- [ ] Tests E2E frontend
- [ ] Tests de charge

**Livrable** : Application web fonctionnelle avec toutes les features de base

**Statut** : � **93% Complété - Finalisation en cours**

---

### 🎨 Phase 2 : Enhancement (Avril - Mai 2026)

**Objectif** : Améliorer l'expérience utilisateur et ajouter des features premium

#### UX/UI Improvements

- [ ] Onboarding interactif
- [ ] Tutoriels guidés
- [ ] Animations avancées
- [ ] Dark mode
- [ ] Multi-langue (FR, EN, AR)
- [ ] Accessibilité (WCAG 2.1)

#### Features Premium

- [ ] Scan OCR avancé
  - [ ] Support multi-formats (PDF, JPG, PNG)
  - [ ] Reconnaissance multi-compagnies
  - [ ] Validation automatique
- [ ] Analytics avancés
  - [ ] Prédictions d'économies
  - [ ] Recommandations personnalisées
  - [ ] Comparaisons avec autres utilisateurs
- [ ] Notifications push web
- [ ] Export de données (PDF, CSV)

#### Business

- [ ] Intégration Stripe complète
  - [ ] Paiements récurrents
  - [ ] Webhooks
  - [ ] Gestion des échecs de paiement
- [ ] Programme de parrainage
  - [ ] Codes de parrainage
  - [ ] Bonus pour parrain et filleul
- [ ] Système de badges et achievements

**Livrable** : Application enrichie avec expérience premium

**Statut** : 🔄 **0% - Planifié**

---

### 🤝 Phase 3 : Marketplace (Juin - Juillet 2026)

**Objectif** : Permettre les échanges de kilos entre utilisateurs

#### Marketplace Features

- [ ] Système de transfert de kilos
  - [ ] Recherche d'utilisateurs
  - [ ] Demandes de transfert
  - [ ] Confirmations
- [ ] Marketplace public
  - [ ] Offres de kilos
  - [ ] Demandes de kilos
  - [ ] Système de matching
- [ ] Système de notation
  - [ ] Reviews utilisateurs
  - [ ] Score de confiance
- [ ] Historique des échanges
- [ ] Frais de marketplace (5%)

#### Security & Trust

- [ ] Vérification d'identité
- [ ] Système anti-fraude
- [ ] Escrow pour transactions
- [ ] Support client dédié

**Livrable** : Marketplace fonctionnel et sécurisé

**Statut** : 🔄 **0% - Planifié**

---

### 🏢 Phase 4 : B2B Dashboard (Août - Septembre 2026)

**Objectif** : Attirer les compagnies aériennes comme partenaires

#### Dashboard Compagnies

- [ ] Interface dédiée compagnies
  - [ ] Vue d'ensemble des flux
  - [ ] Statistiques détaillées
  - [ ] Rapports personnalisés
- [ ] Analytics B2B
  - [ ] Optimisation de remplissage
  - [ ] Prévisions de poids
  - [ ] ROI du partenariat
- [ ] API pour compagnies
  - [ ] Intégration systèmes existants
  - [ ] Webhooks
  - [ ] Documentation dédiée
- [ ] Gestion des partenariats
  - [ ] Contrats
  - [ ] Commissions
  - [ ] Facturation automatique

#### Partenariats

- [ ] Négociations avec 5 compagnies majeures
- [ ] Pilotes avec 2 compagnies
- [ ] Programme de certification

**Livrable** : Plateforme B2B opérationnelle avec premiers partenaires

**Statut** : 🔄 **0% - Planifié**

---

### 📱 Phase 5 : Mobile App (Octobre - Décembre 2026)

**Objectif** : Lancer l'application mobile native

#### React Native App

- [ ] Architecture React Native
- [ ] Design mobile-first
- [ ] Features principales
  - [ ] Scan de tickets via caméra
  - [ ] Wallet mobile
  - [ ] Notifications push natives
  - [ ] Géolocalisation (aéroports)
- [ ] Intégration Apple Wallet / Google Pay
- [ ] Mode offline
- [ ] Biométrie (Face ID, Touch ID)

#### App Stores

- [ ] Publication iOS App Store
- [ ] Publication Google Play Store
- [ ] App Store Optimization (ASO)
- [ ] Campagne de lancement

**Livrable** : Applications iOS et Android en production

**Statut** : 🔄 **0% - Planifié**

---

### 🌍 Phase 6 : International Expansion (2027)

**Objectif** : Expansion géographique et scaling

#### Internationalisation

- [ ] Support multi-devises (EUR, USD, GBP, etc.)
- [ ] Localisation complète (10+ langues)
- [ ] Conformité RGPD/GDPR
- [ ] Conformité réglementations locales
- [ ] Partenariats internationaux

#### Scaling

- [ ] Infrastructure cloud scalable
- [ ] CDN global
- [ ] Multi-région database
- [ ] Load balancing avancé
- [ ] Monitoring et alerting

#### Marketing

- [ ] Campagnes publicitaires ciblées
- [ ] Partenariats influenceurs voyage
- [ ] Présence salons aéronautiques
- [ ] Relations presse internationales

**Livrable** : Présence dans 20+ pays

**Statut** : 🔄 **0% - Vision long terme**

---

## 🎯 Objectifs Chiffrés

### 2026

- **Q1** : MVP lancé, 1000 utilisateurs beta
- **Q2** : 10,000 utilisateurs, 2 compagnies partenaires
- **Q3** : 50,000 utilisateurs, marketplace actif
- **Q4** : 100,000 utilisateurs, app mobile lancée

### 2027

- **Q1** : 250,000 utilisateurs
- **Q2** : 500,000 utilisateurs, 10 compagnies partenaires
- **Q3** : 750,000 utilisateurs, expansion européenne
- **Q4** : 1,000,000 utilisateurs, expansion mondiale

---

## 💰 Objectifs Financiers

### Revenus Projetés

**2026**

- Q1 : 10K€ (beta)
- Q2 : 50K€
- Q3 : 150K€
- Q4 : 300K€
- **Total** : 510K€

**2027**

- Q1 : 500K€
- Q2 : 750K€
- Q3 : 1M€
- Q4 : 1.5M€
- **Total** : 3.75M€

### Sources de Revenus

1. **Abonnements** (60%)
   - Premium : 4.99€/mois
   - Family : 9.99€/mois
2. **Frais de Service** (25%)
   - 1€ par kg utilisé
3. **Commissions B2B** (10%)
   - Partenariats compagnies
4. **Marketplace** (5%)
   - 5% sur transferts

---

## 🎯 Fonctionnalités Manquantes - Analyse Détaillée

### 🔴 CRITIQUE - MVP Bloquant (7% restant)

#### Frontend - Intégrations Critiques

**1. Intégration OCR dans l'interface (3-4 heures)**

- [ ] **Upload de fichier dans `/flights/add`**
  - Composant FileUpload avec drag & drop
  - Preview de l'image uploadée
  - Validation du format (JPG, PNG, PDF)
  - Taille maximale 5MB
- [ ] **Appel API `/flights/scan-ticket`**
  - Loading state pendant le scan
  - Affichage des résultats extraits
  - Pré-remplissage du formulaire
  - Gestion des erreurs OCR
- [ ] **UX du scan**
  - Bouton "Scanner un ticket"
  - Indicateur de confiance (high/medium/low)
  - Option de correction manuelle
  - Retry en cas d'échec

**Impact** : Fonctionnalité clé différenciante, essentielle pour l'expérience utilisateur

**2. Composants UI Réutilisables (4-5 heures)**

- [ ] **Navbar avec navigation**
  - Logo + liens principaux
  - Menu utilisateur (dropdown)
  - Notifications badge
  - Responsive mobile (hamburger menu)
- [ ] **Sidebar Dashboard**
  - Navigation entre sections
  - Indicateurs visuels (active state)
  - Collapsible sur mobile
  - Quick actions
- [ ] **Modal Component**
  - Overlay avec backdrop
  - Animations d'entrée/sortie
  - Fermeture au clic extérieur
  - Gestion du focus (accessibilité)
- [ ] **Error Boundaries**
  - Capture des erreurs React
  - Affichage gracieux
  - Bouton de retry
  - Logging des erreurs

**Impact** : Améliore la cohérence de l'interface et la maintenabilité du code

**3. Pages d'Erreur (1-2 heures)**

- [ ] **404 - Page Not Found**
  - Design branded
  - Suggestions de navigation
  - Recherche rapide
- [ ] **500 - Server Error**
  - Message explicatif
  - Contact support
  - Bouton refresh
- [ ] **403 - Forbidden**
  - Explication des permissions
  - Lien vers upgrade (si applicable)

**Impact** : Professionnalise l'application et améliore l'UX en cas d'erreur

#### Backend - Fonctionnalités Manquantes

**4. Rate Limiting (2-3 heures)**

- [ ] **Middleware de rate limiting**
  - Limite par IP
  - Limite par utilisateur
  - Endpoints sensibles protégés
  - Headers de rate limit
- [ ] **Configuration flexible**
  - Limites par endpoint
  - Whitelist pour admin
  - Redis pour le stockage

**Impact** : Sécurité essentielle contre les abus et attaques DDoS

**5. Système de Notifications In-App (4-5 heures)**

- [ ] **Backend**
  - Modèle Notification (DB)
  - Endpoint `GET /notifications`
  - Endpoint `POST /notifications/mark-read`
  - Endpoint `PUT /notifications/preferences`
  - WebSocket pour temps réel (optionnel)
- [ ] **Frontend**
  - Bell icon avec badge
  - Dropdown de notifications
  - Marquage lu/non-lu
  - Pagination

**Impact** : Améliore l'engagement utilisateur et la communication

---

### 🟡 HAUTE PRIORITÉ - Post-MVP Immédiat (Phase 2)

#### Améliorations UX/UI

**6. Loading States & Skeletons (2-3 heures)**

- [ ] Skeleton screens pour toutes les pages
- [ ] Loading spinners contextuels
- [ ] Progress bars pour uploads
- [ ] Optimistic UI updates

**7. Recherche et Filtres Avancés (3-4 heures)**

- [ ] Recherche globale (vols, transactions)
- [ ] Filtres multi-critères
- [ ] Tri personnalisé (date, montant, etc.)
- [ ] Sauvegarde des préférences de filtrage

**8. Export de Données (3-4 heures)**

- [ ] Export CSV (transactions, vols)
- [ ] Export PDF (rapports)
- [ ] Génération de factures
- [ ] Historique d'exports

#### Features Business

**9. Programme de Parrainage (5-6 heures)**

- [ ] Génération de codes de parrainage
- [ ] Tracking des parrainages
- [ ] Système de récompenses
- [ ] Dashboard de parrainage

**10. Analytics Utilisateur (4-5 heures)**

- [ ] Graphiques d'évolution (kg économisés)
- [ ] Prédictions d'économies
- [ ] Comparaisons avec moyennes
- [ ] Badges et achievements

---

### 🟢 MOYENNE PRIORITÉ - Amélioration Continue

#### Tests & Qualité

**11. Tests Backend (8-10 heures)**

- [ ] Tests unitaires (pytest)
  - Tests des services
  - Tests des endpoints
  - Tests des modèles
- [ ] Tests d'intégration
  - Flow complet d'authentification
  - Flow de création de vol
  - Flow de transaction
- [ ] Coverage >80%

**12. Tests Frontend (8-10 heures)**

- [ ] Tests unitaires (Jest)
- [ ] Tests de composants (React Testing Library)
- [ ] Tests E2E (Playwright)
  - Parcours utilisateur complet
  - Scénarios critiques

#### Optimisations

**13. Performance (4-5 heures)**

- [ ] Lazy loading des images
- [ ] Code splitting par route
- [ ] Caching API (React Query)
- [ ] Optimisation des requêtes DB (indexes)
- [ ] Compression des assets

**14. SEO & Accessibilité (3-4 heures)**

- [ ] Sitemap.xml dynamique
- [ ] Meta tags dynamiques par page
- [ ] Schema.org markup
- [ ] ARIA labels complets
- [ ] Keyboard navigation
- [ ] Screen reader support

---

### 🔵 BASSE PRIORITÉ - Nice to Have

**15. Dark Mode (3-4 heures)**

- [ ] Toggle dark/light
- [ ] Préférence système
- [ ] Persistance du choix

**16. Multi-langue i18n (6-8 heures)**

- [ ] Support FR, EN, AR
- [ ] Sélecteur de langue
- [ ] Traduction complète
- [ ] Détection automatique

**17. PWA (4-5 heures)**

- [ ] Service Worker
- [ ] Offline mode basique
- [ ] Install prompt
- [ ] Push notifications natives

**18. Analytics & Monitoring (3-4 heures)**

- [ ] Google Analytics 4
- [ ] Sentry pour error tracking
- [ ] Dashboard de métriques
- [ ] Alertes automatiques

---

## 📊 Estimation Temps de Développement

### MVP Finalisation (7% restant)

| Tâche                       | Temps      | Priorité      |
| --------------------------- | ---------- | ------------- |
| Intégration OCR Frontend    | 3-4h       | 🔴 CRITIQUE   |
| Composants UI Réutilisables | 4-5h       | 🔴 CRITIQUE   |
| Pages d'Erreur              | 1-2h       | 🔴 CRITIQUE   |
| Rate Limiting               | 2-3h       | 🔴 CRITIQUE   |
| Notifications In-App        | 4-5h       | 🔴 CRITIQUE   |
| **TOTAL MVP**               | **14-19h** | **2-3 jours** |

### Post-MVP Immédiat

| Tâche                 | Temps      | Priorité      |
| --------------------- | ---------- | ------------- |
| Loading States        | 2-3h       | 🟡 HAUTE      |
| Recherche Avancée     | 3-4h       | 🟡 HAUTE      |
| Export Données        | 3-4h       | 🟡 HAUTE      |
| Programme Parrainage  | 5-6h       | 🟡 HAUTE      |
| Analytics Utilisateur | 4-5h       | 🟡 HAUTE      |
| **TOTAL Post-MVP**    | **17-22h** | **3-4 jours** |

### Qualité & Tests

| Tâche               | Temps      | Priorité      |
| ------------------- | ---------- | ------------- |
| Tests Backend       | 8-10h      | 🟢 MOYENNE    |
| Tests Frontend      | 8-10h      | 🟢 MOYENNE    |
| Performance         | 4-5h       | 🟢 MOYENNE    |
| SEO & Accessibilité | 3-4h       | 🟢 MOYENNE    |
| **TOTAL Tests**     | **23-29h** | **4-5 jours** |

### Features Avancées

| Tâche            | Temps      | Priorité      |
| ---------------- | ---------- | ------------- |
| Dark Mode        | 3-4h       | 🔵 BASSE      |
| Multi-langue     | 6-8h       | 🔵 BASSE      |
| PWA              | 4-5h       | 🔵 BASSE      |
| Analytics        | 3-4h       | 🔵 BASSE      |
| **TOTAL Avancé** | **16-21h** | **3-4 jours** |

---

## 🚀 Prochaines Actions Immédiates

### Cette Semaine (Finalisation MVP - 7% restant)

**Priorité 1 : Intégration OCR Frontend (Jour 1-2)**

1. ✅ Créer composant FileUpload avec drag & drop
2. ✅ Intégrer l'appel API `/flights/scan-ticket`
3. ✅ Afficher les résultats du scan
4. ✅ Pré-remplir le formulaire automatiquement

**Priorité 2 : Composants UI Essentiels (Jour 2-3)**

1. ✅ Créer Navbar avec navigation complète
2. ✅ Créer Sidebar pour le dashboard
3. ✅ Créer Modal réutilisable
4. ✅ Implémenter Error Boundaries

**Priorité 3 : Sécurité & Erreurs (Jour 3-4)**

1. ✅ Implémenter rate limiting backend
2. ✅ Créer pages d'erreur (404, 500, 403)
3. ✅ Ajouter gestion d'erreurs globale

**Priorité 4 : Notifications (Jour 4-5)**

1. ✅ Créer système de notifications in-app
2. ✅ Ajouter bell icon avec badge
3. ✅ Implémenter dropdown de notifications

### Ce Mois (Post-MVP Immédiat)

**Semaine 2 : Améliorations UX**

1. Ajouter loading states et skeletons partout
2. Implémenter recherche et filtres avancés
3. Créer système d'export de données (CSV/PDF)
4. Optimiser les performances (lazy loading, caching)

**Semaine 3 : Features Business**

1. Développer programme de parrainage
2. Créer analytics utilisateur avancés
3. Ajouter badges et achievements
4. Implémenter onboarding interactif

**Semaine 4 : Tests & Qualité**

1. Écrire tests backend (>80% coverage)
2. Écrire tests frontend (composants + E2E)
3. Optimiser SEO et accessibilité
4. Préparer le lancement beta

### Ce Trimestre (Lancement Public)

**Février : Beta Testing**

1. Déployer sur environnement de staging
2. Inviter 100 beta testeurs
3. Collecter et analyser le feedback
4. Itérer sur les bugs et améliorations

**Mars : Production Launch**

1. Obtenir clés API production (Amadeus, Google Vision)
2. Déployer infrastructure production
3. Configurer monitoring et alertes
4. Lancement officiel avec campagne marketing

---

## 📊 Métriques de Succès (KPIs)

### Produit

- Taux d'adoption : >20% des inscrits actifs mensuellement
- Taux de rétention : >60% à 3 mois
- NPS (Net Promoter Score) : >50

### Business

- CAC (Customer Acquisition Cost) : <10€
- LTV (Lifetime Value) : >100€
- Taux de conversion Free → Premium : >15%

### Technique

- Uptime : >99.9%
- Temps de réponse API : <200ms
- Taux d'erreur : <0.1%

---

## 🤝 Équipe Nécessaire

### Maintenant (Phase 1)

- 1 Full-Stack Developer (Kais)
- 1 UI/UX Designer (freelance)
- 1 QA Tester (freelance)

### Phase 2-3

- +1 Frontend Developer
- +1 Backend Developer
- +1 Product Manager
- +1 Marketing Manager

### Phase 4-6

- +2 Developers
- +1 DevOps Engineer
- +1 Data Analyst
- +1 Customer Success Manager
- +1 Business Developer

---

## 📝 Notes

- Cette roadmap est flexible et sera ajustée selon les retours utilisateurs
- Les dates sont indicatives et peuvent varier
- Les priorités peuvent changer selon les opportunités business
- Feedback continu de la communauté intégré à chaque phase

---

## 🎊 État Actuel du Projet - Résumé Exécutif

### ✅ Ce qui est Complété (93%)

**Backend (95%)** 🎉

- ✅ Architecture FastAPI complète
- ✅ Tous les endpoints CRUD (auth, users, wallet, flights, transactions, subscriptions)
- ✅ Intégration Amadeus API (recherche franchises bagages)
- ✅ Service OCR complet (Google Vision + Tesseract)
- ✅ Système d'authentification JWT avec refresh tokens
- ✅ Email service (SMTP, templates HTML)
- ✅ Password reset & email verification
- ✅ Intégration Stripe complète (paiements, webhooks)
- ✅ Modèles de données PostgreSQL optimisés
- ✅ Configuration Docker & Docker Compose

**Frontend (90%)** 🚀

- ✅ Landing page premium avec animations
- ✅ Pages Login/Register
- ✅ Dashboard utilisateur complet
- ✅ Page Liste des vols (filtres, pagination)
- ✅ Page Détail de vol
- ✅ Page Transactions
- ✅ Page Wallet
- ✅ Page Profil utilisateur
- ✅ Page Abonnements
- ✅ Pages Forgot/Reset Password
- ✅ Design responsive mobile
- ✅ State management (Zustand)
- ✅ API client Axios

**Infrastructure (90%)** 🔧

- ✅ Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- ✅ Scripts de démarrage (Windows + Linux)
- ✅ Configuration environnement (.env.example)
- ✅ Documentation complète (16 fichiers)

### ❌ Ce qui Manque (7%)

**Critiques pour MVP** 🔴

1. Intégration OCR dans le frontend (upload + scan)
2. Composants UI réutilisables (Navbar, Sidebar, Modal)
3. Pages d'erreur (404, 500, 403)
4. Rate limiting backend
5. Système de notifications in-app

**Temps estimé** : 14-19 heures (2-3 jours)

### 🎯 Prochaine Milestone

**MVP 100% Complété** : ~3 Février 2026  
**Beta Launch** : ~15 Février 2026  
**Production Launch** : ~1 Mars 2026

---

**Dernière mise à jour** : 30 Janvier 2026, 16:40  
**Prochaine révision** : 3 Février 2026 (Post-MVP)  
**Statut Global** : 🚀 **93% - Finalisation en cours**

**Made with ✈️ by Kais Oueriemmi**
