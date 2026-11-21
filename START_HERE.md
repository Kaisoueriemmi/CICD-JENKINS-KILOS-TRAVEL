# 🚀 Guide de Démarrage - AirWeight

## ✅ Push Git Complété!

Vos changements ont été poussés sur GitHub avec succès! 🎉

**Commit**: `feat: Complete Docker setup with dev/prod modes and comprehensive documentation`

---

## 🐳 Prochaines Étapes - Lancer Docker

### 1️⃣ Démarrer Docker Desktop

**⚠️ IMPORTANT**: Docker Desktop doit être démarré avant de lancer l'application.

1. **Ouvrez Docker Desktop** depuis le menu Démarrer
2. **Attendez** que Docker soit complètement démarré (icône verte dans la barre des tâches)
3. **Vérifiez** que Docker fonctionne:
   ```bash
   docker --version
   ```

### 2️⃣ Configurer .env

```bash
# Si ce n'est pas déjà fait
copy .env.example .env
notepad .env
```

**Variables minimales à configurer:**

```env
POSTGRES_PASSWORD=votre_mot_de_passe_fort
SECRET_KEY=votre_cle_secrete_min_32_caracteres
```

### 3️⃣ Lancer l'Application

**Option A: Script automatique (Recommandé)**

```bash
# Windows CMD
docker-start.bat

# Windows PowerShell
.\docker-start.ps1
```

**Option B: Commandes manuelles**

```bash
# Mode développement (hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 4️⃣ Accéder à l'Application

Une fois les services démarrés:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 💻 Continuer le Développement du MVP

### Prochaines Tâches (7% restant pour MVP 100%)

D'après `ACTION_PLAN.md`, il reste à finaliser:

#### 1. Notifications Frontend (3-4h)

- [ ] Créer `NotificationBell.tsx` component
- [ ] Créer page `/notifications`
- [ ] Intégrer dans la Navbar
- [ ] Tester le système complet

#### 2. Tests Finaux (1-2h)

- [ ] Tester tous les flows utilisateur
- [ ] Vérifier la responsivité
- [ ] Corriger les bugs éventuels

---

## 🛠️ Workflow de Développement

### 1. Démarrer les Services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Voir les Logs en Temps Réel

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### 3. Développer

Les changements sont automatiquement détectés (hot-reload):

- **Backend**: Modifiez les fichiers dans `backend/`
- **Frontend**: Modifiez les fichiers dans `frontend/src/`

### 4. Tester

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs

### 5. Commit et Push

```bash
git add .
git commit -m "feat: description de votre fonctionnalité"
git push
```

---

## 📚 Documentation Disponible

- **DOCKER_START_HERE.md** - Guide Docker complet
- **ACTION_PLAN.md** - Plan d'action pour finaliser le MVP
- **DEVELOPMENT_PROGRESS.md** - Progression du développement

---

## 🎯 Objectifs

- **Aujourd'hui**: Lancer Docker et tester l'application
- **Cette semaine**: Finaliser les notifications frontend
- **3 Février 2026**: MVP 100% ✅

---

## 🆘 En Cas de Problème

### Docker ne démarre pas

```bash
# Vérifier le statut
docker info

# Redémarrer Docker Desktop
# Fermer et rouvrir Docker Desktop
```

### Port déjà utilisé

```bash
# Modifier docker-compose.dev.yml
ports:
  - "3001:3000"  # Changer le port
```

### Container ne démarre pas

```bash
# Voir les logs
docker-compose -f docker-compose.dev.yml logs backend

# Rebuild
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

---

## ✅ Checklist de Démarrage

- [x] Code poussé sur Git
- [ ] Docker Desktop démarré
- [ ] Fichier .env configuré
- [ ] Services Docker lancés
- [ ] Application accessible
- [ ] Prêt à développer!

---

**Made with 🐳 and ❤️**

**Bon développement! 💪**

---

## 🚀 COMMENCEZ MAINTENANT!

1. **Démarrez Docker Desktop**
2. **Lancez**: `docker-start.bat`
3. **Accédez**: http://localhost:3000
4. **Développez**: Modifiez le code, c'est parti! 🎉
