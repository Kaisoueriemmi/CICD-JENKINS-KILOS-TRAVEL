# Guide de Test OCR - AirWeight

## 🎯 Objectif

Tester et optimiser l'extraction de données des tickets de bagages via OCR (Google Vision + Tesseract).

---

## 📋 Données à Extraire

### Priorité 1 (Essentiel)

- ✅ **Poids du bagage** (ex: 18.5 KG, 23 kg)
- ✅ **Numéro de vol** (ex: TU123, AF1234)

### Priorité 2 (Important)

- ✅ **Numéro d'étiquette** (ex: TU123456789)
- ⚠️ **Date** (si visible)

### Priorité 3 (Bonus)

- ⚠️ **Aéroports** (départ/arrivée)
- ⚠️ **Nom du passager**

---

## 🧪 Cas de Test

### Test 1 : Ticket Standard Tunisair

**Fichier**: `test_tickets/tunisair_standard.jpg`

**Données Attendues**:

```json
{
  "flight_number": "TU123",
  "actual_weight_kg": 18.5,
  "bag_tag": "TU123456789",
  "confidence": "high"
}
```

**Patterns à Reconnaître**:

- `18.5 KG` ou `18,5 kg`
- `TU123` (2 lettres + 3-4 chiffres)
- `TU123456789` (2 lettres + 9 chiffres)

### Test 2 : Ticket Air France

**Fichier**: `test_tickets/airfrance_standard.jpg`

**Données Attendues**:

```json
{
  "flight_number": "AF1234",
  "actual_weight_kg": 22.0,
  "bag_tag": "AF987654321",
  "confidence": "high"
}
```

### Test 3 : Ticket avec Qualité Moyenne

**Fichier**: `test_tickets/low_quality.jpg`

**Objectif**: Tester la robustesse avec photo floue

**Confiance Attendue**: `medium` ou `low`

### Test 4 : Ticket PDF

**Fichier**: `test_tickets/ticket.pdf`

**Objectif**: Tester l'extraction depuis PDF

---

## 🔧 Script de Test

### Backend Test Script

```python
# backend/tests/test_ocr.py
import pytest
from app.services.ocr_service import BaggageTicketOCR

def test_tunisair_ticket():
    ocr = BaggageTicketOCR()
    result = ocr.extract_baggage_data('test_tickets/tunisair_standard.jpg')

    assert result['flight_number'] == 'TU123'
    assert result['weight_kg'] == 18.5
    assert result['bag_tag'] == 'TU123456789'
    assert result['confidence'] in ['high', 'medium']

def test_airfrance_ticket():
    ocr = BaggageTicketOCR()
    result = ocr.extract_baggage_data('test_tickets/airfrance_standard.jpg')

    assert result['flight_number'] == 'AF1234'
    assert result['weight_kg'] == 22.0
    assert result['confidence'] in ['high', 'medium']

def test_low_quality_ticket():
    ocr = BaggageTicketOCR()
    result = ocr.extract_baggage_data('test_tickets/low_quality.jpg')

    # Should still extract something
    assert result['weight_kg'] is not None or result['flight_number'] is not None
```

### Test Manuel via API

```bash
# Test avec curl
curl -X POST http://localhost:8000/api/v1/flights/scan-ticket \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_tickets/tunisair_standard.jpg"
```

---

## 📊 Patterns d'Extraction

### Poids (Weight)

```python
# Patterns actuels
patterns = [
    r'(\d+[.,]\d+)\s*(?:KG|kg)',      # 18.5 KG
    r'(\d+)\s*(?:KG|kg)',              # 23 KG
    r'(?:Weight|Poids|WT|Wt)[:\s]+(\d+[.,]\d+)',  # Weight: 18.5
    r'(?:Weight|Poids|WT|Wt)[:\s]+(\d+)',         # Weight: 18
]
```

**Patterns à Ajouter** (si nécessaire):

```python
# Variations possibles
r'WEIGHT\s*:\s*(\d+[.,]\d+)',  # WEIGHT : 18.5
r'Poids\s*:\s*(\d+[.,]\d+)',   # Poids : 18,5
r'(\d+[.,]\d+)\s*KILOS',       # 18.5 KILOS
```

### Numéro de Vol

```python
# Pattern actuel
pattern = r'\b([A-Z]{2}\d{3,4})\b'  # TU123, AF1234
```

**Améliorations Possibles**:

```python
# Avec contexte
r'(?:FLIGHT|VOL|FLT)\s*[:#]?\s*([A-Z]{2}\d{3,4})'
r'(?:N°|NO|NUM)\s*([A-Z]{2}\d{3,4})'
```

### Numéro d'Étiquette

```python
# Patterns actuels
patterns = [
    r'\b([A-Z]{2}\d{9})\b',  # TU123456789
    r'\b(\d{10})\b',          # 1234567890
]
```

**Améliorations**:

```python
# Avec contexte
r'(?:BAG|TAG|ETIQUETTE)\s*[:#]?\s*([A-Z]{2}\d{9})'
r'(?:BAG|TAG)\s*[:#]?\s*(\d{10})'
```

---

## 🎯 Optimisations

### 1. Prétraitement d'Image

```python
from PIL import Image, ImageEnhance, ImageFilter

def preprocess_image(image_path):
    """Améliorer la qualité de l'image avant OCR"""
    image = Image.open(image_path)

    # Convertir en niveaux de gris
    image = image.convert('L')

    # Augmenter le contraste
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)

    # Augmenter la netteté
    image = image.filter(ImageFilter.SHARPEN)

    # Redimensionner si trop petit
    if image.width < 1000:
        ratio = 1000 / image.width
        new_size = (1000, int(image.height * ratio))
        image = image.resize(new_size, Image.LANCZOS)

    return image
```

### 2. Zones d'Intérêt (ROI)

```python
def extract_weight_region(image):
    """Extraire la zone contenant le poids"""
    # Généralement en bas à droite du ticket
    width, height = image.size

    # Zone inférieure droite (50% bas, 50% droite)
    roi = image.crop((
        width // 2,      # x1
        height // 2,     # y1
        width,           # x2
        height           # y2
    ))

    return roi
```

### 3. Validation Croisée

```python
def validate_extraction(result):
    """Valider la cohérence des données extraites"""
    issues = []

    # Vérifier le poids
    if result['weight_kg']:
        if result['weight_kg'] < 1 or result['weight_kg'] > 50:
            issues.append('Poids hors limites (1-50 kg)')

    # Vérifier le numéro de vol
    if result['flight_number']:
        airline_code = result['flight_number'][:2]
        if airline_code not in KNOWN_AIRLINES:
            issues.append(f'Code compagnie inconnu: {airline_code}')

    # Ajuster la confiance
    if issues:
        result['confidence'] = 'low'
        result['issues'] = issues

    return result
```

---

## 📈 Métriques de Performance

### Objectifs

- **Précision Poids**: >95%
- **Précision Vol**: >90%
- **Temps d'Extraction**: <3 secondes
- **Confiance High**: >70% des cas

### Mesure

```python
def calculate_accuracy(test_results):
    """Calculer la précision de l'OCR"""
    total = len(test_results)
    correct_weight = sum(1 for r in test_results if r['weight_correct'])
    correct_flight = sum(1 for r in test_results if r['flight_correct'])

    return {
        'weight_accuracy': correct_weight / total * 100,
        'flight_accuracy': correct_flight / total * 100,
        'avg_time': sum(r['time'] for r in test_results) / total
    }
```

---

## 🚀 Prochaines Étapes

### Phase 1: Tests Initiaux

1. ✅ Collecter 10-20 vrais tickets de bagages
2. ✅ Tester avec Google Vision API
3. ✅ Tester avec Tesseract
4. ✅ Comparer les résultats

### Phase 2: Optimisation

1. ⚠️ Implémenter prétraitement d'image
2. ⚠️ Ajouter extraction par zones (ROI)
3. ⚠️ Optimiser les patterns regex
4. ⚠️ Ajouter validation croisée

### Phase 3: Production

1. ⚠️ Configurer Google Vision API production
2. ⚠️ Ajouter cache des résultats
3. ⚠️ Implémenter retry logic
4. ⚠️ Monitoring et alertes

---

## 📝 Template de Rapport de Test

```markdown
## Test OCR - [Date]

### Ticket Testé

- **Source**: [Compagnie]
- **Qualité**: [Bonne/Moyenne/Faible]
- **Format**: [JPG/PNG/PDF]

### Résultats

- **Poids Extrait**: [X.X kg]
- **Poids Réel**: [X.X kg]
- **Précision**: [✅ Correct / ❌ Incorrect]

- **Vol Extrait**: [XX123]
- **Vol Réel**: [XX123]
- **Précision**: [✅ Correct / ❌ Incorrect]

- **Confiance**: [high/medium/low]
- **Temps**: [X.X secondes]

### Observations

- [Notes sur la qualité de l'extraction]
- [Problèmes rencontrés]
- [Suggestions d'amélioration]
```

---

## 🔗 Ressources

- [Google Vision API Docs](https://cloud.google.com/vision/docs)
- [Tesseract Documentation](https://tesseract-ocr.github.io/)
- [PIL/Pillow Docs](https://pillow.readthedocs.io/)

---

**Dernière mise à jour**: 26 Janvier 2026  
**Responsable**: Kais Oueriemmi
