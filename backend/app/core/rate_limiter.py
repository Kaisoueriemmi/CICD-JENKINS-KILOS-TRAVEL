"""
Advanced rate limiting and request throttling configuration.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)

# Rate limit definitions
RATE_LIMITS = {
    # Authentication endpoints
    'login': '5/minute',
    'register': '3/minute',
    'password_reset': '3/minute',
    'verify_email': '10/minute',

    # Flight endpoints
    'get_flights': '60/minute',
    'add_flight': '30/minute',
    'scan_ticket': '20/minute',

    # Notification endpoints
    'get_notifications': '60/minute',
    'mark_notification_read': '100/minute',
    'delete_notification': '50/minute',

    # Wallet endpoints
    'get_wallet': '60/minute',
    'get_transactions': '60/minute',
    'transfer_credit': '10/minute',

    # User endpoints
    'get_profile': '60/minute',
    'update_profile': '20/minute',

    # Payment endpoints
    'create_subscription': '5/minute',
    'update_subscription': '10/minute',

    # Default for any unspecified endpoint
    'default': '100/minute',
}

# Endpoint-specific configurations
ENDPOINT_CONFIGS = {
    'login': {
        'limit': '5/minute',
        'key_func': lambda request: request.client.host + request.query_params.get('email', ''),
        'description': 'Login attempts are limited to 5 per minute per email'
    },
    'register': {
        'limit': '3/minute',
        'key_func': lambda request: request.client.host,
        'description': 'Registration attempts are limited to 3 per minute'
    },
    'scan_ticket': {
        'limit': '20/minute',
        'key_func': get_remote_address,
        'description': 'Ticket scanning is limited to 20 per minute'
    },
}


class RateLimitError(HTTPException):
    """Custom exception for rate limit violations."""

    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f'Rate limit exceeded. Try again after {retry_after} seconds',
            headers={'Retry-After': str(retry_after)},
        )


def get_rate_limit_for_endpoint(endpoint: str) -> str:
    """Get rate limit for specific endpoint."""
    return RATE_LIMITS.get(endpoint, RATE_LIMITS['default'])


def get_endpoint_config(endpoint: str):
    """Get custom configuration for endpoint."""
    return ENDPOINT_CONFIGS.get(endpoint, {
        'limit': get_rate_limit_for_endpoint(endpoint),
        'key_func': get_remote_address,
    })


def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> HTTPException:
    """Custom handler for rate limit exceeded."""
    retry_after = int(exc.detail.split()[-1]) if 'retry' in exc.detail.lower() else 60
    raise RateLimitError(retry_after=retry_after)
