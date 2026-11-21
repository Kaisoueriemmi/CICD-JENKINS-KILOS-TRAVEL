# AirWeight - Intégrations API Aéronautiques

## 🎯 Stratégie d'Intégration des Données

### Vue d'Ensemble

AirWeight utilise une **approche hybride** pour obtenir les données de bagages :

1. **API Amadeus** : Franchise bagage autorisée (données publiques)
2. **OCR/Scan** : Poids réel du bagage (validation utilisateur)
3. **IATA Standards** : Codes standardisés (aéroports, compagnies)

---

## 📡 Sources de Données

### 1. Franchise Bagage (Allowance) - AUTOMATIQUE

#### Amadeus Flight Offers API

**Endpoint** : `https://test.api.amadeus.com/v2/shopping/flight-offers`

**Utilisation** : Récupérer automatiquement la franchise bagage autorisée

**Exemple de Réponse** :

```json
{
  "data": [
    {
      "travelerPricings": [
        {
          "fareDetailsBySegment": [
            {
              "includedCheckedBags": {
                "quantity": 1,
                "weight": 23,
                "weightUnit": "KG"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Intégration dans AirWeight** :

- Pré-remplir le champ `allowed_weight_kg` lors de l'ajout d'un vol
- Validation automatique des franchises par compagnie
- Base de données de référence des politiques bagages

#### FlightLabs / Skyscanner

**Alternative** : Données de politiques bagages par compagnie

**Utilisation** :

- Fallback si Amadeus indisponible
- Base de données statique des franchises standard
- Mise à jour mensuelle des politiques

---

### 2. Poids Réel (Actual Weight) - VALIDATION MANUELLE

#### SITA BagJourney API (Futur - Phase B2B)

**Endpoint** : `https://api.sita.aero/bagjourney/v1/bags/{bagTagNumber}`

**Statut** : Accès réservé aux partenaires IATA certifiés

**Exemple de Réponse** :

```json
{
  "bagTagNumber": "TU123456789",
  "weight": 18.5,
  "weightUnit": "KG",
  "status": "LOADED",
  "flightNumber": "TU123",
  "timestamp": "2026-01-26T10:30:00Z"
}
```

**Roadmap** :

- **Phase 1 (MVP)** : OCR uniquement
- **Phase 4 (B2B)** : Partenariat SITA pour accès API
- **Phase 6** : Intégration directe compagnies partenaires

#### OCR - Solution MVP (Tesseract + Google Vision)

**Implémentation Actuelle** :

```python
# backend/app/services/ocr_service.py
import pytesseract
from google.cloud import vision
from PIL import Image
import re

class BaggageTicketOCR:
    """Service OCR pour extraction de données de tickets bagages"""

    def __init__(self):
        self.vision_client = vision.ImageAnnotatorClient()

    def extract_baggage_data(self, image_path: str) -> dict:
        """
        Extrait les données d'un ticket de bagage

        Données recherchées :
        - Numéro de vol (ex: TU123, AF1234)
        - Poids (ex: 18.5 KG, 23 KG)
        - Numéro d'étiquette (ex: TU123456789)
        - Date
        """
        # Google Vision API (meilleure précision)
        with open(image_path, 'rb') as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = self.vision_client.text_detection(image=image)
        text = response.text_annotations[0].description

        # Extraction des données
        data = {
            'flight_number': self._extract_flight_number(text),
            'weight_kg': self._extract_weight(text),
            'bag_tag': self._extract_bag_tag(text),
            'raw_text': text
        }

        return data

    def _extract_weight(self, text: str) -> float:
        """Extrait le poids du texte OCR"""
        # Patterns: "18.5 KG", "23KG", "Weight: 18.5"
        patterns = [
            r'(\d+\.?\d*)\s*KG',
            r'(\d+\.?\d*)\s*kg',
            r'Weight:\s*(\d+\.?\d*)',
            r'Poids:\s*(\d+\.?\d*)'
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1))

        return None

    def _extract_flight_number(self, text: str) -> str:
        """Extrait le numéro de vol"""
        # Pattern: 2 lettres + 3-4 chiffres (ex: TU123, AF1234)
        pattern = r'\b([A-Z]{2}\d{3,4})\b'
        match = re.search(pattern, text)
        return match.group(1) if match else None

    def _extract_bag_tag(self, text: str) -> str:
        """Extrait le numéro d'étiquette bagage"""
        # Pattern: 2 lettres + 9 chiffres (ex: TU123456789)
        pattern = r'\b([A-Z]{2}\d{9})\b'
        match = re.search(pattern, text)
        return match.group(1) if match else None
```

**Données Extraites** :

- ✅ Numéro de vol (validation croisée)
- ✅ Poids réel en KG
- ✅ Numéro d'étiquette bagage (traçabilité)
- ✅ Date (si visible)

---

### 3. Standards IATA - RÉFÉRENCE

#### Codes Aéroports (IATA Airport Codes)

**Source** : IATA Open API Hub

**Endpoint** : `https://api.iata.org/airports`

**Exemples** :

```json
{
  "TUN": {
    "name": "Tunis-Carthage International Airport",
    "city": "Tunis",
    "country": "Tunisia",
    "iata": "TUN",
    "icao": "DTTA"
  },
  "CDG": {
    "name": "Charles de Gaulle Airport",
    "city": "Paris",
    "country": "France",
    "iata": "CDG",
    "icao": "LFPG"
  }
}
```

**Intégration** :

- Autocomplete dans le formulaire d'ajout de vol
- Validation des codes aéroports
- Affichage des noms complets

#### Codes Compagnies (IATA Airline Codes)

**Base de Données Locale** :

```python
# backend/app/data/airlines.py
AIRLINES = {
    "TU": {
        "name": "Tunisair",
        "iata": "TU",
        "icao": "TAR",
        "country": "Tunisia",
        "baggage_policy": {
            "economy": {"pieces": 1, "weight_kg": 23},
            "business": {"pieces": 2, "weight_kg": 32}
        }
    },
    "AF": {
        "name": "Air France",
        "iata": "AF",
        "icao": "AFR",
        "country": "France",
        "baggage_policy": {
            "economy": {"pieces": 1, "weight_kg": 23},
            "business": {"pieces": 2, "weight_kg": 32}
        }
    },
    # ... 200+ compagnies
}
```

#### Electronic Bag Tags (EBT) - FUTUR

**IATA Resolution 753** : Suivi des bagages à chaque étape

**Technologies** :

- QR Code sur étiquettes
- NFC tags
- RFID tracking

**Roadmap AirWeight** :

- **Phase 5** : Scan QR code via app mobile
- **Phase 6** : Lecture NFC pour validation instantanée

---

## 🔧 Architecture d'Intégration

### Flux de Données - MVP

```
┌─────────────────┐
│  Utilisateur    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  1. Saisie Manuelle Vol             │
│     - Numéro de vol: TU123          │
│     - Aéroports: TUN → CDG          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  2. API Amadeus (Optionnel)         │
│     → Récupère franchise: 23 KG     │
│     → Pré-remplit le formulaire     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  3. Upload Photo Ticket             │
│     → Scan OCR (Tesseract/Vision)   │
│     → Extrait: 18.5 KG              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  4. Validation & Calcul             │
│     → Différence: 23 - 18.5 = 4.5   │
│     → Crédit: 4.5 × 1.5 = 6.75 KG   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  5. Crédit Wallet                   │
│     → +6.75 KG dans le portefeuille │
└─────────────────────────────────────┘
```

### Flux de Données - Phase B2B (Futur)

```
┌─────────────────┐
│  Compagnie      │
│  Aérienne       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  SITA BagJourney API                │
│  → Webhook temps réel               │
│  → Poids exact: 18.5 KG             │
│  → Status: LOADED                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  AirWeight Backend                  │
│  → Crédit automatique               │
│  → Notification utilisateur         │
└─────────────────────────────────────┘
```

---

## 📊 Tableau Récapitulatif des Sources

| Type de Donnée       | Source Recommandée     | Disponibilité           | Usage dans AirWeight         | Phase   |
| -------------------- | ---------------------- | ----------------------- | ---------------------------- | ------- |
| **Franchise Max**    | Amadeus API            | ✅ Haute (Self-Service) | Calculer le plafond autorisé | MVP     |
| **Statut Bagage**    | SITA API / FlightStats | ⚠️ Moyenne (Enterprise) | Confirmer bagage à bord      | Phase 4 |
| **Poids Réel**       | OCR (Scan Ticket)      | ✅ N/A (Donnée privée)  | Validation du crédit         | MVP     |
| **Codes Compagnies** | IATA Open API Hub      | ✅ Très Haute           | Standardisation DB           | MVP     |
| **Codes Aéroports**  | IATA Open API Hub      | ✅ Très Haute           | Autocomplete, validation     | MVP     |
| **Electronic Tags**  | NFC/QR Scan            | 🔄 Futur (IATA 753)     | Validation instantanée       | Phase 5 |

---

## 🚀 Implémentation Recommandée - MVP

### 1. Configuration Amadeus API

```python
# backend/app/services/amadeus_service.py
from amadeus import Client, ResponseError

class AmadeusService:
    def __init__(self):
        self.amadeus = Client(
            client_id=settings.AMADEUS_API_KEY,
            client_secret=settings.AMADEUS_API_SECRET
        )

    def get_baggage_allowance(self, flight_number: str, date: str) -> dict:
        """
        Récupère la franchise bagage pour un vol

        Args:
            flight_number: Numéro de vol (ex: "TU123")
            date: Date du vol (YYYY-MM-DD)

        Returns:
            {
                "pieces": 1,
                "weight_kg": 23,
                "weight_unit": "KG"
            }
        """
        try:
            response = self.amadeus.shopping.flight_offers_search.get(
                originLocationCode="TUN",
                destinationLocationCode="CDG",
                departureDate=date,
                adults=1
            )

            # Extraire baggage allowance
            offer = response.data[0]
            baggage = offer['travelerPricings'][0]['fareDetailsBySegment'][0]['includedCheckedBags']

            return {
                "pieces": baggage.get('quantity', 1),
                "weight_kg": baggage.get('weight', 23),
                "weight_unit": baggage.get('weightUnit', 'KG')
            }

        except ResponseError as error:
            print(f"Amadeus API Error: {error}")
            return None
```

### 2. Endpoint API Amélioré

```python
# backend/app/api/v1/endpoints/flights.py

@router.post("/lookup-allowance")
async def lookup_baggage_allowance(
    flight_number: str,
    departure_airport: str,
    arrival_airport: str,
    flight_date: str,
    amadeus_service: AmadeusService = Depends(get_amadeus_service)
):
    """
    Recherche automatique de la franchise bagage via Amadeus API
    """
    allowance = amadeus_service.get_baggage_allowance(
        flight_number=flight_number,
        date=flight_date
    )

    if allowance:
        return {
            "success": True,
            "allowed_weight_kg": allowance['weight_kg'],
            "pieces": allowance['pieces']
        }

    # Fallback: base de données locale
    airline_code = flight_number[:2]
    default_allowance = AIRLINES.get(airline_code, {}).get('baggage_policy', {})

    return {
        "success": False,
        "allowed_weight_kg": default_allowance.get('economy', {}).get('weight_kg', 23),
        "source": "default_policy"
    }
```

### 3. Endpoint OCR

```python
@router.post("/scan-ticket")
async def scan_baggage_ticket(
    file: UploadFile = File(...),
    ocr_service: BaggageTicketOCR = Depends(get_ocr_service)
):
    """
    Scan d'un ticket de bagage pour extraction du poids réel
    """
    # Sauvegarder temporairement l'image
    file_path = f"/tmp/{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Extraction OCR
    data = ocr_service.extract_baggage_data(file_path)

    return {
        "success": True,
        "flight_number": data['flight_number'],
        "actual_weight_kg": data['weight_kg'],
        "bag_tag": data['bag_tag'],
        "confidence": "high" if data['weight_kg'] else "low"
    }
```

---

## 💡 Recommandations Stratégiques

### Phase 1 (MVP - Maintenant)

1. ✅ **OCR Tesseract/Google Vision** : Solution immédiate et gratuite
2. ✅ **Base de données IATA locale** : 200+ compagnies avec politiques
3. 🔄 **Amadeus API (Optionnel)** : Améliore UX mais pas bloquant

### Phase 4 (B2B - 6-12 mois)

1. 🔄 **Certification IATA** : Accès SITA BagJourney API
2. 🔄 **Partenariats compagnies** : Accès direct aux données Weight & Balance
3. 🔄 **Intégration GDS** : Amadeus, Sabre, Travelport

### Phase 5 (Mobile - 12-18 mois)

1. 🔄 **Scan QR Code** : Lecture Electronic Bag Tags
2. 🔄 **NFC Reading** : Validation instantanée
3. 🔄 **Géolocalisation** : Détection automatique aéroport

---

## 📝 Variables d'Environnement Nécessaires

```bash
# Amadeus API
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
AMADEUS_ENVIRONMENT=test  # ou 'production'

# Google Vision API
GOOGLE_VISION_API_KEY=your_api_key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# SITA (Futur)
SITA_API_KEY=your_api_key
SITA_API_SECRET=your_api_secret
```

---

**Dernière mise à jour** : 26 Janvier 2026  
**Prochaine révision** : Après intégration Amadeus MVP
