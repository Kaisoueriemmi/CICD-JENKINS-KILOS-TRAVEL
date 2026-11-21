# 🛠️ AirWeight - Tâches de Développement Prioritaires

**Date** : 30 Janvier 2026  
**Statut** : MVP à 93% - 7% restant  
**Objectif** : MVP 100% d'ici le 3 Février 2026

---

## 🎯 Vue d'Ensemble

Ce document liste les **tâches concrètes** à accomplir pour finaliser le MVP, avec des instructions détaillées pour chaque tâche.

---

## 🔴 TÂCHE 1 : Intégration OCR Frontend (3-4h)

### Objectif

Permettre aux utilisateurs de scanner leurs tickets de bagages directement depuis l'interface web.

### Étapes Détaillées

#### 1.1 Créer le Composant FileUpload (1h)

**Fichier** : `frontend/src/components/FileUpload.tsx`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export default function FileUpload({
  onFileSelect,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSize = 5 * 1024 * 1024, // 5MB
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('Le fichier est trop volumineux (max 5MB)');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Format non supporté (JPG, PNG, PDF uniquement)');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Créer preview pour les images
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
    accept: { [accept]: [] },
    maxSize,
    multiple: false,
  });

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive
              ? 'Déposez le fichier ici'
              : 'Glissez-déposez votre ticket ici'}
          </p>
          <p className="text-sm text-gray-500">
            ou cliquez pour sélectionner un fichier
          </p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG ou PDF (max 5MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
```

**Dépendances à installer** :

```bash
npm install react-dropzone lucide-react
```

---

#### 1.2 Intégrer dans la Page Add Flight (1.5h)

**Fichier** : `frontend/src/app/flights/add/page.tsx`

Ajouter dans le composant :

```typescript
import FileUpload from "@/components/FileUpload";
import { useState } from "react";
import { flightsAPI } from "@/lib/api";

// Dans le composant
const [isScanning, setIsScanning] = useState(false);
const [scanResults, setScanResults] = useState<any>(null);

const handleFileSelect = async (file: File) => {
  setIsScanning(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await flightsAPI.scanTicket(formData);

    setScanResults(response.data);

    // Pré-remplir le formulaire
    if (response.data.flight_number) {
      setFlightNumber(response.data.flight_number);
    }
    if (response.data.actual_weight) {
      setActualWeight(response.data.actual_weight);
    }
    if (response.data.bag_tag_number) {
      setBagTagNumber(response.data.bag_tag_number);
    }

    toast.success("Ticket scanné avec succès !");
  } catch (error) {
    toast.error("Erreur lors du scan. Veuillez réessayer.");
  } finally {
    setIsScanning(false);
  }
};
```

Ajouter dans le JSX :

```typescript
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">
    Scanner un ticket de bagage
  </h3>
  <FileUpload onFileSelect={handleFileSelect} />

  {isScanning && (
    <div className="mt-4 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Scan en cours...</span>
    </div>
  )}

  {scanResults && (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm font-medium text-green-800 mb-2">
        ✅ Données extraites avec succès
      </p>
      <div className="text-xs text-green-700">
        <p>Confiance : {scanResults.confidence}</p>
        {scanResults.flight_number && (
          <p>Vol : {scanResults.flight_number}</p>
        )}
        {scanResults.actual_weight && (
          <p>Poids : {scanResults.actual_weight} kg</p>
        )}
      </div>
    </div>
  )}
</div>

<div className="border-t pt-6 mt-6">
  <h3 className="text-lg font-semibold mb-3">
    Ou saisir manuellement
  </h3>
  {/* Formulaire existant */}
</div>
```

---

#### 1.3 Ajouter l'Endpoint API (0.5h)

**Fichier** : `frontend/src/lib/api.ts`

```typescript
export const flightsAPI = {
  // ... endpoints existants

  scanTicket: (formData: FormData) =>
    api.post("/flights/scan-ticket", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};
```

---

### ✅ Checklist de Complétion

- [ ] Composant FileUpload créé
- [ ] Dépendances installées (react-dropzone, lucide-react)
- [ ] Intégration dans /flights/add
- [ ] Endpoint API ajouté
- [ ] Test avec une vraie image
- [ ] Gestion des erreurs
- [ ] Loading state
- [ ] Preview de l'image

---

## 🔴 TÂCHE 2 : Composants UI Réutilisables (4-5h)

### 2.1 Navbar (1.5h)

**Fichier** : `frontend/src/components/Navbar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Plane,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Vols', href: '/flights' },
    { name: 'Wallet', href: '/wallet' },
    { name: 'Transactions', href: '/transactions' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Plane className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AirWeight
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profil
                  </Link>
                  <Link
                    href="/subscription"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Abonnement
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  block px-3 py-2 rounded-md text-base font-medium
                  ${isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
```

---

### 2.2 Sidebar (1.5h)

**Fichier** : `frontend/src/components/Sidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plane,
  Wallet,
  ArrowLeftRight,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vols', href: '/flights', icon: Plane },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Abonnement', href: '/subscription', icon: CreditCard },
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div
      className={`
        bg-white border-r min-h-screen transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3 bg-white border rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="mt-8 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-3 rounded-lg transition-all
                  ${active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {!isCollapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-0 right-0 px-6">
          <div className="text-xs text-gray-500 text-center">
            <p>AirWeight v1.0.0</p>
            <p className="mt-1">© 2026</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### ✅ Checklist Composants UI

- [ ] Navbar créée avec navigation
- [ ] Menu utilisateur (dropdown)
- [ ] Badge notifications
- [ ] Responsive mobile (hamburger)
- [ ] Sidebar créée
- [ ] Navigation avec icônes
- [ ] Indicateur de section active
- [ ] Collapsible
- [ ] Modal réutilisable
- [ ] Error Boundary

**Temps estimé** : 4-5 heures

---

## 📋 Prochaines Tâches à Documenter

1. Pages d'Erreur (404, 500, 403)
2. Rate Limiting Backend
3. Système de Notifications In-App

---

**Dernière mise à jour** : 30 Janvier 2026, 17:00  
**Responsable** : Kais Oueriemmi

**Made with ✈️ and 💻**
