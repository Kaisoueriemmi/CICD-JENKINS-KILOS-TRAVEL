"""
Stripe Payment Service for AirWeight
Handles subscription payments and webhook processing
"""
import stripe
from typing import Optional, Dict
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)


class StripeService:
    """Service for Stripe payment processing"""

    def __init__(self):
        """Initialize Stripe service"""
        self.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)
        self.webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)

        if not self.api_key:
            logger.warning("Stripe API key not configured")

    def create_checkout_session(
        self,
        user_email: str,
        plan_type: str,
        success_url: str,
        cancel_url: str
    ) -> Optional[Dict]:
        """
        Create a Stripe Checkout Session

        Args:
            user_email: User's email address
            plan_type: Subscription plan type (premium, family)
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel

        Returns:
            Dictionary with session ID and URL
        """
        if not self.api_key:
            logger.error("Stripe not configured")
            return None

        try:
            # Define price IDs for each plan
            price_ids = {
                'premium': getattr(settings, 'STRIPE_PREMIUM_PRICE_ID', 'price_premium'),
                'family': getattr(settings, 'STRIPE_FAMILY_PRICE_ID', 'price_family')
            }

            price_id = price_ids.get(plan_type.lower())
            if not price_id:
                logger.error(f"Invalid plan type: {plan_type}")
                return None

            # Create checkout session
            session = stripe.checkout.Session.create(
                customer_email=user_email,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
                metadata={
                    'plan_type': plan_type
                }
            )

            return {
                'session_id': session.id,
                'url': session.url
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error creating checkout session: {e}")
            return None

    def create_customer_portal_session(
        self,
        customer_id: str,
        return_url: str
    ) -> Optional[str]:
        """
        Create a Stripe Customer Portal Session

        Args:
            customer_id: Stripe customer ID
            return_url: URL to return to after portal

        Returns:
            Portal session URL
        """
        if not self.api_key:
            logger.error("Stripe not configured")
            return None

        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )

            return session.url

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error creating portal session: {e}")
            return None

    def cancel_subscription(self, subscription_id: str) -> bool:
        """
        Cancel a Stripe subscription

        Args:
            subscription_id: Stripe subscription ID

        Returns:
            True if successful, False otherwise
        """
        if not self.api_key:
            logger.error("Stripe not configured")
            return False

        try:
            stripe.Subscription.delete(subscription_id)
            return True

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error cancelling subscription: {e}")
            return False

    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str
    ) -> Optional[Dict]:
        """
        Verify Stripe webhook signature

        Args:
            payload: Request body
            signature: Stripe signature header

        Returns:
            Event dictionary if valid, None otherwise
        """
        if not self.webhook_secret:
            logger.error("Webhook secret not configured")
            return None

        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return event

        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            return None
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            return None

    def handle_checkout_completed(self, session: Dict) -> Dict:
        """
        Handle successful checkout completion

        Args:
            session: Checkout session object

        Returns:
            Dictionary with subscription details
        """
        return {
            'customer_email': session.get('customer_email'),
            'subscription_id': session.get('subscription'),
            'plan_type': session.get('metadata', {}).get('plan_type'),
            'amount_paid': session.get('amount_total', 0) / 100  # Convert from cents
        }

    def handle_subscription_updated(self, subscription: Dict) -> Dict:
        """
        Handle subscription update event

        Args:
            subscription: Subscription object

        Returns:
            Dictionary with subscription details
        """
        return {
            'subscription_id': subscription.get('id'),
            'status': subscription.get('status'),
            'current_period_end': subscription.get('current_period_end'),
            'cancel_at_period_end': subscription.get('cancel_at_period_end')
        }

    def handle_subscription_deleted(self, subscription: Dict) -> Dict:
        """
        Handle subscription deletion event

        Args:
            subscription: Subscription object

        Returns:
            Dictionary with subscription details
        """
        return {
            'subscription_id': subscription.get('id'),
            'status': 'cancelled'
        }

    def get_subscription_details(self, subscription_id: str) -> Optional[Dict]:
        """
        Get subscription details from Stripe

        Args:
            subscription_id: Stripe subscription ID

        Returns:
            Dictionary with subscription details
        """
        if not self.api_key:
            logger.error("Stripe not configured")
            return None

        try:
            subscription = stripe.Subscription.retrieve(subscription_id)

            return {
                'id': subscription.id,
                'status': subscription.status,
                'current_period_start': subscription.current_period_start,
                'current_period_end': subscription.current_period_end,
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'plan': subscription['items']['data'][0]['price']['id']
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting subscription: {e}")
            return None


# Dependency for FastAPI
def get_stripe_service() -> StripeService:
    """Dependency to get Stripe service instance"""
    return StripeService()
