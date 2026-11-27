"""
OCR Service for Baggage Ticket Scanning
Extracts weight and flight information from baggage tags
"""
import pytesseract
from google.cloud import vision
from PIL import Image
import re
import logging
from typing import Optional, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)


class BaggageTicketOCR:
    """Service for OCR extraction from baggage tickets"""

    def __init__(self):
        """Initialize OCR service"""
        try:
            # Initialize Google Vision API client if credentials are available
            if settings.GOOGLE_VISION_API_KEY:
                self.vision_client = vision.ImageAnnotatorClient()
                self.use_google_vision = True
                logger.info("Google Vision API initialized")
            else:
                self.vision_client = None
                self.use_google_vision = False
                logger.info("Using Tesseract OCR (Google Vision not configured)")
        except Exception as e:
            logger.warning(f"Google Vision initialization failed: {e}. Falling back to Tesseract")
            self.vision_client = None
            self.use_google_vision = False

    def extract_baggage_data(self, image_path: str) -> Dict:
        """
        Extract baggage data from ticket image

        Args:
            image_path: Path to the baggage ticket image

        Returns:
            Dictionary with extracted data:
            {
                'flight_number': str,
                'weight_kg': float,
                'bag_tag': str,
                'raw_text': str,
                'confidence': str ('high', 'medium', 'low')
            }
        """
        try:
            # Extract text using appropriate OCR method
            if self.use_google_vision and self.vision_client:
                text = self._extract_text_google_vision(image_path)
            else:
                text = self._extract_text_tesseract(image_path)

            # Extract structured data from text
            data = {
                'flight_number': self._extract_flight_number(text),
                'weight_kg': self._extract_weight(text),
                'bag_tag': self._extract_bag_tag(text),
                'raw_text': text,
                'confidence': self._calculate_confidence(text)
            }

            logger.info(f"Extracted baggage data: {data}")
            return data

        except Exception as e:
            logger.error(f"OCR extraction error: {e}")
            return {
                'flight_number': None,
                'weight_kg': None,
                'bag_tag': None,
                'raw_text': '',
                'confidence': 'low'
            }

    def _extract_text_google_vision(self, image_path: str) -> str:
        """Extract text using Google Vision API"""
        with open(image_path, 'rb') as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = self.vision_client.text_detection(image=image)

        if response.text_annotations:
            return response.text_annotations[0].description
        return ""

    def _extract_text_tesseract(self, image_path: str) -> str:
        """Extract text using Tesseract OCR"""
        image = Image.open(image_path)

        # Preprocess image for better OCR
        # Convert to grayscale
        image = image.convert('L')

        # Extract text
        text = pytesseract.image_to_string(image, config='--psm 6')
        return text

    def _extract_weight(self, text: str) -> Optional[float]:
        """
        Extract weight from OCR text

        Patterns recognized:
        - "18.5 KG", "23KG", "18,5 kg"
        - "Weight: 18.5", "Poids: 18.5"
        - "WT: 18.5", "Wt 18.5"
        """
        patterns = [
            r'(\d+[.,]\d+)\s*(?:KG|kg)',  # 18.5 KG or 18,5 kg
            r'(\d+)\s*(?:KG|kg)',          # 23 KG
            r'(?:Weight|Poids|WT|Wt)[:\s]+(\d+[.,]\d+)',  # Weight: 18.5
            r'(?:Weight|Poids|WT|Wt)[:\s]+(\d+)',         # Weight: 18
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                weight_str = match.group(1).replace(',', '.')
                try:
                    weight = float(weight_str)
                    # Sanity check: baggage weight should be between 1 and 50 kg
                    if 1 <= weight <= 50:
                        return weight
                except ValueError:
                    continue

        return None

    def _extract_flight_number(self, text: str) -> Optional[str]:
        """
        Extract flight number from OCR text

        Pattern: 2 letters + 3-4 digits (e.g., TU123, AF1234)
        """
        pattern = r'\b([A-Z]{2}\d{3,4})\b'
        match = re.search(pattern, text)
        return match.group(1) if match else None

    def _extract_bag_tag(self, text: str) -> Optional[str]:
        """
        Extract bag tag number from OCR text

        Pattern: 2 letters + 9 digits (e.g., TU123456789)
        or 10-digit number
        """
        patterns = [
            r'\b([A-Z]{2}\d{9})\b',  # TU123456789
            r'\b(\d{10})\b',          # 1234567890
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)

        return None

    def _calculate_confidence(self, text: str) -> str:
        """
        Calculate confidence level based on extracted data

        Returns: 'high', 'medium', or 'low'
        """
        score = 0

        # Check for weight
        if self._extract_weight(text):
            score += 40

        # Check for flight number
        if self._extract_flight_number(text):
            score += 30

        # Check for bag tag
        if self._extract_bag_tag(text):
            score += 30

        if score >= 70:
            return 'high'
        elif score >= 40:
            return 'medium'
        else:
            return 'low'


# Dependency for FastAPI
def get_ocr_service() -> BaggageTicketOCR:
    """Dependency to get OCR service instance"""
    return BaggageTicketOCR()
