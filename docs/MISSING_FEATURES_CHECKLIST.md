# ✅ AirWeight - Checklist des Fonctionnalités Manquantes

**Date de création** : 30 Janvier 2026  
**Statut Global** : 93% Complété  
**Objectif** : 100% MVP d'ici le 3 Février 2026

---

## 🎯 Vue d'Ensemble

```
Progression Globale: ████████████████████░ 93%

Backend:  ████████████████████░ 95%
Frontend: ██████████████████░░ 90%
Tests:    ░░░░░░░░░░░░░░░░░░░░  0%
```

---

## 🔴 PRIORITÉ CRITIQUE - MVP Bloquant (7% restant)

### 1. Intégration OCR Frontend (3-4h)

**Objectif** : Permettre aux utilisateurs de scanner leurs tickets de bagages

- [ ] **Composant FileUpload** (`frontend/src/components/FileUpload.tsx`)
  - [ ] Interface drag & drop
  - [ ] Preview de l'image uploadée
  - [ ] Validation format (JPG, PNG, PDF)
  - [ ] Limite de taille (5MB max)
  - [ ] Indicateur de progression

- [ ] **Intégration dans `/flights/add`**
  - [ ] Bouton "Scanner un ticket"
  - [ ] Appel API `POST /flights/scan-ticket`
  - [ ] Loading state pendant le scan
  - [ ] Affichage des résultats extraits
  - [ ] Pré-remplissage automatique du formulaire

- [ ] **Gestion des erreurs**
  - [ ] Message si format invalide
  - [ ] Message si OCR échoue
  - [ ] Option de retry
  - [ ] Fallback vers saisie manuelle

**Fichiers à créer/modifier** :

- `frontend/src/components/FileUpload.tsx` (nouveau)
- `frontend/src/app/flights/add/page.tsx` (modifier)
- `frontend/src/lib/api.ts` (ajouter endpoint)

**Temps estimé** : 3-4 heures  
**Statut** : ❌ À faire

---

### 2. Composants UI Réutilisables (4-5h)

**Objectif** : Créer une bibliothèque de composants cohérents et réutilisables

#### 2.1 Navbar (1.5h)

- [ ] **Composant Navbar** (`frontend/src/components/Navbar.tsx`)
  - [ ] Logo AirWeight (lien vers home)
  - [ ] Navigation principale (Dashboard, Vols, Wallet, etc.)
  - [ ] Menu utilisateur (dropdown)
    - [ ] Avatar/Initiales
    - [ ] Nom + email
    - [ ] Lien vers Profil
    - [ ] Lien vers Abonnement
    - [ ] Bouton Déconnexion
  - [ ] Badge de notifications
  - [ ] Responsive mobile (hamburger menu)

**Fichier** : `frontend/src/components/Navbar.tsx` (nouveau)

#### 2.2 Sidebar (1.5h)

- [ ] **Composant Sidebar** (`frontend/src/components/Sidebar.tsx`)
  - [ ] Liste des sections
    - [ ] Dashboard (icône + label)
    - [ ] Vols (icône + label)
    - [ ] Wallet (icône + label)
    - [ ] Transactions (icône + label)
    - [ ] Profil (icône + label)
    - [ ] Abonnement (icône + label)
  - [ ] Indicateur de section active
  - [ ] Collapsible sur mobile
  - [ ] Quick actions (boutons rapides)
  - [ ] Footer avec version

**Fichier** : `frontend/src/components/Sidebar.tsx` (nouveau)

#### 2.3 Modal (1h)

- [ ] **Composant Modal** (`frontend/src/components/Modal.tsx`)
  - [ ] Overlay avec backdrop
  - [ ] Animations d'entrée/sortie (Framer Motion)
  - [ ] Fermeture au clic extérieur
  - [ ] Fermeture avec touche Escape
  - [ ] Gestion du focus (accessibilité)
  - [ ] Props: title, children, onClose, size

**Fichier** : `frontend/src/components/Modal.tsx` (nouveau)

#### 2.4 Error Boundary (1h)

- [ ] **Error Boundary** (`frontend/src/components/ErrorBoundary.tsx`)
  - [ ] Capture des erreurs React
  - [ ] Affichage gracieux de l'erreur
  - [ ] Bouton "Réessayer"
  - [ ] Logging des erreurs (console + Sentry optionnel)
  - [ ] Fallback UI personnalisé

**Fichier** : `frontend/src/components/ErrorBoundary.tsx` (nouveau)

**Temps estimé** : 4-5 heures  
**Statut** : ❌ À faire

---

### 3. Pages d'Erreur (1-2h)

**Objectif** : Gérer élégamment les erreurs et pages introuvables

- [ ] **Page 404** (`frontend/src/app/not-found.tsx`)
  - [ ] Design branded AirWeight
  - [ ] Message "Page non trouvée"
  - [ ] Suggestions de navigation
  - [ ] Bouton retour à l'accueil
  - [ ] Recherche rapide (optionnel)

- [ ] **Page 500** (`frontend/src/app/error.tsx`)
  - [ ] Message d'erreur serveur
  - [ ] Explication simple
  - [ ] Bouton "Rafraîchir"
  - [ ] Contact support
  - [ ] Code d'erreur (pour debug)

- [ ] **Page 403** (composant réutilisable)
  - [ ] Message "Accès refusé"
  - [ ] Explication des permissions
  - [ ] Lien vers upgrade (si applicable)
  - [ ] Bouton retour

**Fichiers à créer** :

- `frontend/src/app/not-found.tsx` (nouveau)
- `frontend/src/app/error.tsx` (nouveau)
- `frontend/src/components/ForbiddenPage.tsx` (nouveau)

**Temps estimé** : 1-2 heures  
**Statut** : ❌ À faire

---

### 4. Rate Limiting Backend (2-3h)

**Objectif** : Protéger l'API contre les abus et attaques DDoS

- [ ] **Middleware de rate limiting** (`backend/app/middleware/rate_limit.py`)
  - [ ] Limite par IP (ex: 100 req/min)
  - [ ] Limite par utilisateur authentifié (ex: 1000 req/hour)
  - [ ] Configuration par endpoint
  - [ ] Headers de rate limit (X-RateLimit-\*)
  - [ ] Réponse 429 Too Many Requests

- [ ] **Configuration Redis**
  - [ ] Stockage des compteurs dans Redis
  - [ ] TTL automatique
  - [ ] Clés par IP et par user

- [ ] **Endpoints sensibles à protéger**
  - [ ] `/auth/login` (5 tentatives/min)
  - [ ] `/auth/register` (3 inscriptions/hour par IP)
  - [ ] `/flights/scan-ticket` (10 scans/min)
  - [ ] `/auth/forgot-password` (3 demandes/hour)

- [ ] **Whitelist admin**
  - [ ] Bypass pour IPs admin
  - [ ] Configuration via .env

**Fichiers à créer/modifier** :

- `backend/app/middleware/rate_limit.py` (nouveau)
- `backend/app/main.py` (ajouter middleware)
- `backend/requirements.txt` (ajouter slowapi)

**Temps estimé** : 2-3 heures  
**Statut** : ❌ À faire

---

### 5. Système de Notifications In-App (4-5h)

**Objectif** : Notifier les utilisateurs des événements importants

#### 5.1 Backend (2.5h)

- [ ] **Modèle Notification** (`backend/app/models/notification.py`)

  ```python
  - id: UUID
  - user_id: UUID (FK)
  - type: Enum (credit, debit, flight, subscription, system)
  - title: String
  - message: String
  - read: Boolean
  - created_at: DateTime
  ```

- [ ] **Endpoints** (`backend/app/api/v1/endpoints/notifications.py`)
  - [ ] `GET /notifications` - Liste des notifications
  - [ ] `GET /notifications/unread-count` - Nombre non lues
  - [ ] `POST /notifications/{id}/mark-read` - Marquer comme lue
  - [ ] `POST /notifications/mark-all-read` - Tout marquer
  - [ ] `DELETE /notifications/{id}` - Supprimer
  - [ ] `PUT /notifications/preferences` - Préférences

- [ ] **Service de notifications** (`backend/app/services/notification_service.py`)
  - [ ] Création de notification
  - [ ] Envoi en temps réel (optionnel: WebSocket)
  - [ ] Templates de messages

#### 5.2 Frontend (2h)

- [ ] **Composant NotificationBell** (`frontend/src/components/NotificationBell.tsx`)
  - [ ] Icône cloche avec badge (nombre non lues)
  - [ ] Dropdown au clic
  - [ ] Liste des notifications récentes
  - [ ] Marquage lu au clic
  - [ ] Lien "Voir tout"
  - [ ] Animation pour nouvelles notifications

- [ ] **Page Notifications** (`frontend/src/app/notifications/page.tsx`)
  - [ ] Liste complète paginée
  - [ ] Filtres par type
  - [ ] Marquage multiple
  - [ ] Suppression
  - [ ] Préférences de notification

**Fichiers à créer** :

- `backend/app/models/notification.py` (nouveau)
- `backend/app/api/v1/endpoints/notifications.py` (nouveau)
- `backend/app/services/notification_service.py` (nouveau)
- `frontend/src/components/NotificationBell.tsx` (nouveau)
- `frontend/src/app/notifications/page.tsx` (nouveau)

**Temps estimé** : 4-5 heures  
**Statut** : ❌ À faire

---

## 📊 Résumé des Tâches Critiques

| #         | Tâche                       | Temps           | Fichiers   | Statut |
| --------- | --------------------------- | --------------- | ---------- | ------ |
| 1         | Intégration OCR Frontend    | 3-4h            | 3 fichiers | ❌     |
| 2         | Composants UI Réutilisables | 4-5h            | 4 fichiers | ❌     |
| 3         | Pages d'Erreur              | 1-2h            | 3 fichiers | ❌     |
| 4         | Rate Limiting Backend       | 2-3h            | 3 fichiers | ❌     |
| 5         | Notifications In-App        | 4-5h            | 5 fichiers | ❌     |
| **TOTAL** | **14-19h**                  | **18 fichiers** | **0%**     |

---

## 🟡 HAUTE PRIORITÉ - Post-MVP (17-22h)

### 6. Loading States & Skeletons (2-3h)

- [ ] **Skeleton Components** (`frontend/src/components/skeletons/`)
  - [ ] FlightCardSkeleton
  - [ ] TransactionCardSkeleton
  - [ ] DashboardSkeleton
  - [ ] TableSkeleton

- [ ] **Loading States**
  - [ ] Spinner global
  - [ ] Progress bars pour uploads
  - [ ] Optimistic UI updates

**Temps estimé** : 2-3 heures  
**Statut** : ❌ À faire

---

### 7. Recherche et Filtres Avancés (3-4h)

- [ ] **Recherche Globale**
  - [ ] Barre de recherche dans Navbar
  - [ ] Recherche multi-entités (vols, transactions)
  - [ ] Résultats en temps réel
  - [ ] Raccourci clavier (Ctrl+K)

- [ ] **Filtres Avancés**
  - [ ] Filtres multi-critères
  - [ ] Sauvegarde des préférences
  - [ ] Presets de filtres

**Temps estimé** : 3-4 heures  
**Statut** : ❌ À faire

---

### 8. Export de Données (3-4h)

- [ ] **Export CSV**
  - [ ] Transactions
  - [ ] Vols
  - [ ] Configuration des colonnes

- [ ] **Export PDF**
  - [ ] Rapports mensuels
  - [ ] Factures
  - [ ] Récapitulatifs

- [ ] **Génération de Factures**
  - [ ] Template professionnel
  - [ ] Logo + infos entreprise
  - [ ] Détails de transaction

**Temps estimé** : 3-4 heures  
**Statut** : ❌ À faire

---

### 9. Programme de Parrainage (5-6h)

- [ ] **Backend**
  - [ ] Modèle ReferralCode
  - [ ] Endpoints de parrainage
  - [ ] Système de récompenses
  - [ ] Tracking des conversions

- [ ] **Frontend**
  - [ ] Page de parrainage
  - [ ] Génération de code
  - [ ] Partage social
  - [ ] Dashboard de stats

**Temps estimé** : 5-6 heures  
**Statut** : ❌ À faire

---

### 10. Analytics Utilisateur (4-5h)

- [ ] **Graphiques d'Évolution**
  - [ ] Kg économisés dans le temps
  - [ ] Argent économisé
  - [ ] Nombre de vols

- [ ] **Prédictions**
  - [ ] Économies futures estimées
  - [ ] Recommandations personnalisées

- [ ] **Comparaisons**
  - [ ] Vs moyenne des utilisateurs
  - [ ] Vs mois précédent
  - [ ] Badges et achievements

**Temps estimé** : 4-5 heures  
**Statut** : ❌ À faire

---

## 🟢 MOYENNE PRIORITÉ - Tests & Qualité (23-29h)

### 11. Tests Backend (8-10h)

- [ ] **Tests Unitaires (pytest)**
  - [ ] Tests des services (OCR, Amadeus, Email, Stripe)
  - [ ] Tests des endpoints (tous les endpoints)
  - [ ] Tests des modèles
  - [ ] Tests des utils

- [ ] **Tests d'Intégration**
  - [ ] Flow d'authentification complet
  - [ ] Flow de création de vol
  - [ ] Flow de transaction
  - [ ] Flow d'abonnement

- [ ] **Coverage**
  - [ ] Objectif: >80%
  - [ ] Rapport de coverage
  - [ ] CI/CD integration

**Temps estimé** : 8-10 heures  
**Statut** : ❌ À faire

---

### 12. Tests Frontend (8-10h)

- [ ] **Tests Unitaires (Jest)**
  - [ ] Tests des utils
  - [ ] Tests des hooks
  - [ ] Tests des stores Zustand

- [ ] **Tests de Composants (React Testing Library)**
  - [ ] Tests des composants UI
  - [ ] Tests des pages
  - [ ] Tests d'interaction

- [ ] **Tests E2E (Playwright)**
  - [ ] Parcours complet utilisateur
  - [ ] Scénarios critiques
  - [ ] Tests multi-navigateurs

**Temps estimé** : 8-10 heures  
**Statut** : ❌ À faire

---

### 13. Performance (4-5h)

- [ ] **Optimisations Frontend**
  - [ ] Lazy loading des images
  - [ ] Code splitting par route
  - [ ] React Query pour caching
  - [ ] Memoization des composants

- [ ] **Optimisations Backend**
  - [ ] Indexes sur colonnes fréquentes
  - [ ] Optimisation des requêtes N+1
  - [ ] Caching Redis
  - [ ] Compression des réponses

**Temps estimé** : 4-5 heures  
**Statut** : ❌ À faire

---

### 14. SEO & Accessibilité (3-4h)

- [ ] **SEO**
  - [ ] Sitemap.xml dynamique
  - [ ] Meta tags par page
  - [ ] Schema.org markup
  - [ ] Open Graph tags

- [ ] **Accessibilité (WCAG 2.1)**
  - [ ] ARIA labels complets
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Contrast ratios
  - [ ] Focus management

**Temps estimé** : 3-4 heures  
**Statut** : ❌ À faire

---

## 🔵 BASSE PRIORITÉ - Nice to Have (16-21h)

### 15. Dark Mode (3-4h)

- [ ] Toggle dark/light
- [ ] Préférence système
- [ ] Persistance du choix
- [ ] Thème personnalisé

**Temps estimé** : 3-4 heures  
**Statut** : ❌ À faire

---

### 16. Multi-langue i18n (6-8h)

- [ ] Support FR, EN, AR
- [ ] Sélecteur de langue
- [ ] Traduction complète
- [ ] Détection automatique
- [ ] RTL pour l'arabe

**Temps estimé** : 6-8 heures  
**Statut** : ❌ À faire

---

### 17. PWA (4-5h)

- [ ] Service Worker
- [ ] Offline mode basique
- [ ] Install prompt
- [ ] Push notifications natives
- [ ] Manifest.json

**Temps estimé** : 4-5 heures  
**Statut** : ❌ À faire

---

### 18. Analytics & Monitoring (3-4h)

- [ ] Google Analytics 4
- [ ] Sentry pour error tracking
- [ ] Dashboard de métriques
- [ ] Alertes automatiques
- [ ] Performance monitoring

**Temps estimé** : 3-4 heures  
**Statut** : ❌ À faire

---

## 📅 Planning Recommandé

### Semaine 1 (31 Jan - 6 Fév) - Finalisation MVP

| Jour      | Tâches                                                 | Heures  |
| --------- | ------------------------------------------------------ | ------- |
| Lundi     | Intégration OCR Frontend                               | 4h      |
| Mardi     | Composants UI (Navbar, Sidebar)                        | 4h      |
| Mercredi  | Composants UI (Modal, Error Boundary) + Pages d'erreur | 4h      |
| Jeudi     | Rate Limiting Backend                                  | 3h      |
| Vendredi  | Notifications In-App (Backend)                         | 3h      |
| Samedi    | Notifications In-App (Frontend)                        | 2h      |
| **TOTAL** | **MVP 100% Complété**                                  | **20h** |

### Semaine 2 (7-13 Fév) - Post-MVP

| Jour      | Tâches                             | Heures  |
| --------- | ---------------------------------- | ------- |
| Lundi     | Loading States & Skeletons         | 3h      |
| Mardi     | Recherche et Filtres Avancés       | 4h      |
| Mercredi  | Export de Données                  | 4h      |
| Jeudi     | Programme de Parrainage (Backend)  | 3h      |
| Vendredi  | Programme de Parrainage (Frontend) | 3h      |
| Samedi    | Analytics Utilisateur              | 5h      |
| **TOTAL** | **Features Post-MVP**              | **22h** |

### Semaine 3-4 (14-27 Fév) - Tests & Qualité

| Période   | Tâches                            | Heures  |
| --------- | --------------------------------- | ------- |
| Semaine 3 | Tests Backend + Frontend          | 18h     |
| Semaine 4 | Performance + SEO + Accessibilité | 8h      |
| **TOTAL** | **Tests & Optimisations**         | **26h** |

---

## 🎯 Milestones

- ✅ **Phase 0 - Foundation** : 26 Janvier 2026 (100%)
- 🔄 **Phase 1 - MVP** : 3 Février 2026 (93% → 100%)
- 📅 **Phase 1.5 - Post-MVP** : 13 Février 2026 (0% → 100%)
- 📅 **Phase 1.8 - Tests** : 27 Février 2026 (0% → 100%)
- 📅 **Beta Launch** : 1 Mars 2026
- 📅 **Production Launch** : 15 Mars 2026

---

## 📊 Métriques de Progression

```
Phase 0 (Foundation):     ████████████████████ 100%
Phase 1 (MVP):            ███████████████████░  93%
Phase 1.5 (Post-MVP):     ░░░░░░░░░░░░░░░░░░░░   0%
Phase 1.8 (Tests):        ░░░░░░░░░░░░░░░░░░░░   0%
Phase 2 (Enhancement):    ░░░░░░░░░░░░░░░░░░░░   0%

GLOBAL:                   ███████████████████░  93%
```

---

**Dernière mise à jour** : 30 Janvier 2026, 16:40  
**Prochaine révision** : 3 Février 2026  
**Responsable** : Kais Oueriemmi

**Made with ✈️ and ☕**
