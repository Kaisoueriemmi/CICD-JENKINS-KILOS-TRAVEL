# 🚀 Guide de Démarrage Rapide - AirWeight MVP

**Objectif** : Passer de 93% à 100% du MVP en 2-3 jours  
**Date de début** : 30 Janvier 2026  
**Date cible** : 3 Février 2026

---

## 📋 Avant de Commencer

### Prérequis

✅ Projet cloné et configuré  
✅ Backend fonctionnel (http://localhost:8000)  
✅ Frontend fonctionnel (http://localhost:3000)  
✅ Base de données PostgreSQL active  
✅ Redis actif

### Vérification Rapide

```bash
# Vérifier que tout fonctionne
cd backend
uvicorn app.main:app --reload

# Dans un autre terminal
cd frontend
npm run dev
```

Ouvrir http://localhost:3000 - La landing page doit s'afficher ✅

---

## 🎯 Plan d'Action (2-3 Jours)

### Jour 1 : Intégration OCR Frontend (4h)

#### Matin (2h)

**1. Installer les dépendances**

```bash
cd frontend
npm install react-dropzone lucide-react
```

**2. Créer le composant FileUpload**

Créer `frontend/src/components/FileUpload.tsx`

<details>
<summary>Voir le code complet</summary>

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        setError('Fichier invalide (JPG, PNG, PDF uniquement, max 5MB)');
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
        }

        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="w-full">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">
            {isDragActive ? 'Déposez ici' : 'Glissez votre ticket ici'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            JPG, PNG ou PDF (max 5MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

</details>

#### Après-midi (2h)

**3. Intégrer dans la page Add Flight**

Modifier `frontend/src/app/flights/add/page.tsx` :

```typescript
// Ajouter l'import
import FileUpload from '@/components/FileUpload';

// Ajouter les states
const [isScanning, setIsScanning] = useState(false);
const [scanResults, setScanResults] = useState<any>(null);

// Ajouter la fonction
const handleFileSelect = async (file: File) => {
  setIsScanning(true);
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/api/v1/flights/scan-ticket', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();
    setScanResults(data);

    // Pré-remplir le formulaire
    if (data.flight_number) setFlightNumber(data.flight_number);
    if (data.actual_weight) setActualWeight(data.actual_weight);

    alert('✅ Ticket scanné avec succès !');
  } catch (error) {
    alert('❌ Erreur lors du scan');
  } finally {
    setIsScanning(false);
  }
};

// Ajouter dans le JSX avant le formulaire
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Scanner un ticket</h3>
  <FileUpload onFileSelect={handleFileSelect} />
  {isScanning && <p className="mt-2 text-blue-600">Scan en cours...</p>}
</div>
```

**4. Tester**

- Aller sur http://localhost:3000/flights/add
- Uploader une image de ticket
- Vérifier que le formulaire se pré-remplit

✅ **Jour 1 Complété !**

---

### Jour 2 : Composants UI (4h)

#### Matin (2h) - Navbar

**1. Créer la Navbar**

Créer `frontend/src/components/Navbar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Plane, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Plane className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">AirWeight</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
          <Link href="/flights" className="text-gray-700 hover:text-blue-600">Vols</Link>
          <Link href="/wallet" className="text-gray-700 hover:text-blue-600">Wallet</Link>

          <button className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"
            >
              U
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Profil
                </Link>
                <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**2. Intégrer dans le layout**

Modifier `frontend/src/app/layout.tsx` :

```typescript
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

#### Après-midi (2h) - Sidebar & Modal

**3. Créer la Sidebar**

Créer `frontend/src/components/Sidebar.tsx` (code simplifié)

**4. Créer le Modal**

Créer `frontend/src/components/Modal.tsx`

```typescript
'use client';

import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

✅ **Jour 2 Complété !**

---

### Jour 3 : Pages d'Erreur & Rate Limiting (4h)

#### Matin (2h) - Pages d'Erreur

**1. Page 404**

Créer `frontend/src/app/not-found.tsx` :

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page non trouvée</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Retour au Dashboard
        </Link>
      </div>
    </div>
  );
}
```

**2. Page Error**

Créer `frontend/src/app/error.tsx` :

```typescript
'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">500</h1>
        <p className="text-xl text-gray-600 mt-4">Une erreur est survenue</p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
```

#### Après-midi (2h) - Rate Limiting Backend

**3. Installer slowapi**

```bash
cd backend
pip install slowapi
```

**4. Configurer le rate limiting**

Créer `backend/app/middleware/rate_limit.py` :

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

**5. Appliquer dans main.py**

```python
from app.middleware.rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Sur les endpoints sensibles
@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    ...
```

✅ **Jour 3 Complété !**

---

### Jour 4-5 : Notifications & Tests (4h)

**1. Backend Notifications**

Créer le modèle, les endpoints et le service (voir DEVELOPMENT_TASKS.md)

**2. Frontend Notifications**

Créer le composant NotificationBell et la page

**3. Tests Finaux**

- Tester tous les flows
- Corriger les bugs
- Vérifier la responsivité

✅ **MVP 100% COMPLÉTÉ !**

---

## 📊 Checklist de Progression

### Jour 1 ✅

- [ ] FileUpload component créé
- [ ] Intégré dans /flights/add
- [ ] Testé avec une image
- [ ] Formulaire pré-rempli automatiquement

### Jour 2 ✅

- [ ] Navbar créée et intégrée
- [ ] Sidebar créée
- [ ] Modal créé
- [ ] Error Boundary ajouté

### Jour 3 ✅

- [ ] Page 404 créée
- [ ] Page Error créée
- [ ] Rate limiting backend implémenté
- [ ] Testé sur endpoints sensibles

### Jour 4-5 ✅

- [ ] Modèle Notification créé
- [ ] Endpoints notifications créés
- [ ] NotificationBell component créé
- [ ] Page notifications créée
- [ ] Tests complets effectués

---

## 🚨 En Cas de Problème

### Erreur CORS

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Erreur d'Upload

Vérifier que le backend accepte les fichiers :

```python
@router.post("/scan-ticket")
async def scan_ticket(file: UploadFile = File(...)):
    ...
```

### Erreur de Build Frontend

```bash
rm -rf .next
npm install
npm run dev
```

---

## 📞 Ressources Utiles

- **Documentation Détaillée** : [DEVELOPMENT_TASKS.md](./DEVELOPMENT_TASKS.md)
- **Checklist Complète** : [MISSING_FEATURES_CHECKLIST.md](./MISSING_FEATURES_CHECKLIST.md)
- **Planning Détaillé** : [DETAILED_PLANNING.md](./DETAILED_PLANNING.md)
- **API Docs** : http://localhost:8000/docs

---

## 🎯 Objectif Final

**3 Février 2026** : MVP 100% Complété ✅

Ensuite :

- Semaine 2 : Post-MVP features
- Semaine 3-4 : Tests
- 15 Mars : Production Launch 🚀

---

**Let's build this! 💪**

**Made with ✈️ and ☕**
