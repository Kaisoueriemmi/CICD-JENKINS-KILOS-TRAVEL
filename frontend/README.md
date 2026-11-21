# AirWeight Frontend

Frontend Next.js 14 pour la plateforme AirWeight.

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

## 📁 Structure

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # Connexion/Inscription
│   ├── dashboard/page.tsx # Dashboard utilisateur
│   └── flights/
│       └── add/page.tsx   # Ajout de vol
├── components/            # Composants réutilisables
│   └── ui/               # Composants UI
├── lib/                  # Utilitaires
│   ├── api.ts           # Client API Axios
│   └── store.ts         # State management Zustand
└── app/globals.css      # Styles globaux

```

## 🎨 Pages Créées

### ✅ Landing Page (`/`)

- Hero section avec CTA
- Features showcase
- Pricing plans
- Footer complet

### ✅ Login/Register (`/login`)

- Formulaire de connexion
- Formulaire d'inscription
- Validation des champs
- Social login (UI ready)
- Toast notifications

### ✅ Dashboard (`/dashboard`)

- Stats du wallet (solde, économies, impact CO₂)
- Vols récents
- Transactions récentes
- Quick actions
- Navigation complète

### ✅ Ajout de Vol (`/flights/add`)

- Scan OCR de ticket (UI ready)
- Saisie manuelle
- Calcul automatique des crédits
- Preview de la différence
- Validation des données

## 🔧 Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **HTTP**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📡 API Integration

Le frontend communique avec le backend via Axios :

```typescript
// Exemple d'utilisation
import { authAPI, walletAPI, flightAPI } from "@/lib/api";

// Login
const response = await authAPI.login(email, password);

// Get wallet
const wallet = await walletAPI.getWallet();

// Add flight
const flight = await flightAPI.createFlight(data);
```

## 🎯 Prochaines Étapes

### À Implémenter

- [ ] Page liste des vols
- [ ] Page détail d'un vol
- [ ] Page transactions
- [ ] Page wallet détaillée
- [ ] Page abonnements
- [ ] Page profil utilisateur
- [ ] Intégration OCR réelle
- [ ] Tests E2E

### Améliorations

- [ ] Dark mode
- [ ] Multi-langue (i18n)
- [ ] PWA
- [ ] Notifications push
- [ ] Analytics

## 🔐 Variables d'Environnement

Créer un fichier `.env.local` :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📝 Scripts

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer production
npm start

# Linter
npm run lint

# Type check
npm run type-check
```

## 🎨 Design System

### Couleurs

- **Primary**: Blue (sky)
- **Secondary**: Purple
- **Success**: Green
- **Error**: Red

### Components

- `btn-primary`: Bouton principal avec gradient
- `btn-secondary`: Bouton secondaire
- `btn-outline`: Bouton outline
- `input-field`: Champ de saisie
- `card-premium`: Carte avec ombre
- `stat-card`: Carte de statistique avec gradient

## 📱 Responsive

Toutes les pages sont responsive :

- Mobile first
- Breakpoints Tailwind (sm, md, lg, xl)
- Grid adaptatif

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
vercel
```

### Docker

```bash
docker build -t airweight-frontend .
docker run -p 3000:3000 airweight-frontend
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

**Made with ✈️ by Kais Oueriemmi**
