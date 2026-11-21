"""
Rate Limiting Middleware
Utilise slowapi pour limiter le nombre de requêtes par IP
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse


# Créer le limiter avec la clé basée sur l'IP du client
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/hour"],  # Limite par défaut : 200 requêtes par heure
    storage_uri="memory://",  # Utiliser la mémoire (pour Redis: "redis://localhost:6379")
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Handler personnalisé pour les erreurs de rate limit
    """
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Trop de requêtes. Veuillez réessayer plus tard.",
            "error": "rate_limit_exceeded",
            "retry_after": exc.detail,
        },
    )


# Limites spécifiques pour différents types d'endpoints
RATE_LIMITS = {
    # Authentification - très restrictif
    "auth_login": "60/minute",
    "auth_register": "3/minute",
    "auth_forgot_password": "3/minute",
    "auth_reset_password": "3/minute",
    
    # OCR - modérément restrictif (coûteux en ressources)
    "ocr_scan": "10/minute",
    
    # API générale - permissif
    "api_general": "60/minute",
    
    # Création de ressources - modéré
    "create_resource": "30/minute",
    
    # Lecture - très permissif
    "read_resource": "100/minute",
}


def get_rate_limit(endpoint_type: str) -> str:
    """
    Récupère la limite de taux pour un type d'endpoint donné
    
    Args:
        endpoint_type: Type d'endpoint (auth_login, ocr_scan, etc.)
        
    Returns:
        Limite de taux au format "X/minute" ou "X/hour"
    """
    return RATE_LIMITS.get(endpoint_type, "60/minute")
