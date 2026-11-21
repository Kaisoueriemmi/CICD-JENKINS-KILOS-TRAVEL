"""
Notification Service
Service pour créer et gérer les notifications in-app
"""

from sqlalchemy.orm import Session
from app.models.models import Notification, NotificationType
from typing import Optional


class NotificationService:
    """Service for managing in-app notifications"""
    
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        action_url: Optional[str] = None,
        action_label: Optional[str] = None,
        related_flight_id: Optional[int] = None,
        related_transaction_id: Optional[int] = None
    ) -> Notification:
        """
        Create a new notification
        
        Args:
            db: Database session
            user_id: ID of the user to notify
            title: Notification title
            message: Notification message
            notification_type: Type of notification
            action_url: Optional URL for action button
            action_label: Optional label for action button
            related_flight_id: Optional related flight ID
            related_transaction_id: Optional related transaction ID
            
        Returns:
            Created notification
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            action_url=action_url,
            action_label=action_label,
            related_flight_id=related_flight_id,
            related_transaction_id=related_transaction_id
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def notify_flight_credited(
        db: Session,
        user_id: int,
        flight_number: str,
        credit_kg: float,
        flight_id: int
    ) -> Notification:
        """
        Create notification for flight credit
        
        Args:
            db: Database session
            user_id: ID of the user
            flight_number: Flight number
            credit_kg: Amount of kg credited
            flight_id: ID of the flight
            
        Returns:
            Created notification
        """
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title=f"✈️ Vol {flight_number} crédité !",
            message=f"+{credit_kg:.1f} kg ajoutés à votre wallet pour le vol {flight_number}",
            notification_type=NotificationType.CREDIT,
            action_url=f"/flights/{flight_id}",
            action_label="Voir le vol",
            related_flight_id=flight_id
        )
    
    @staticmethod
    def notify_wallet_debit(
        db: Session,
        user_id: int,
        amount_kg: float,
        transaction_id: int,
        description: str
    ) -> Notification:
        """
        Create notification for wallet debit
        
        Args:
            db: Database session
            user_id: ID of the user
            amount_kg: Amount of kg debited
            transaction_id: ID of the transaction
            description: Transaction description
            
        Returns:
            Created notification
        """
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title=f"💳 {amount_kg:.1f} kg utilisés",
            message=description or f"{amount_kg:.1f} kg ont été débités de votre wallet",
            notification_type=NotificationType.DEBIT,
            action_url=f"/transactions/{transaction_id}",
            action_label="Voir la transaction",
            related_transaction_id=transaction_id
        )
    
    @staticmethod
    def notify_transfer_sent(
        db: Session,
        user_id: int,
        amount_kg: float,
        recipient_name: str,
        transaction_id: int
    ) -> Notification:
        """
        Create notification for transfer sent
        
        Args:
            db: Database session
            user_id: ID of the sender
            amount_kg: Amount of kg transferred
            recipient_name: Name of the recipient
            transaction_id: ID of the transaction
            
        Returns:
            Created notification
        """
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title=f"📤 Transfert envoyé",
            message=f"{amount_kg:.1f} kg transférés à {recipient_name}",
            notification_type=NotificationType.TRANSFER,
            action_url=f"/transactions/{transaction_id}",
            action_label="Voir la transaction",
            related_transaction_id=transaction_id
        )
    
    @staticmethod
    def notify_transfer_received(
        db: Session,
        user_id: int,
        amount_kg: float,
        sender_name: str,
        transaction_id: int
    ) -> Notification:
        """
        Create notification for transfer received
        
        Args:
            db: Database session
            user_id: ID of the recipient
            amount_kg: Amount of kg received
            sender_name: Name of the sender
            transaction_id: ID of the transaction
            
        Returns:
            Created notification
        """
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title=f"📥 Transfert reçu !",
            message=f"+{amount_kg:.1f} kg reçus de {sender_name}",
            notification_type=NotificationType.CREDIT,
            action_url=f"/transactions/{transaction_id}",
            action_label="Voir la transaction",
            related_transaction_id=transaction_id
        )
    
    @staticmethod
    def notify_subscription_activated(
        db: Session,
        user_id: int,
        plan_name: str
    ) -> Notification:
        """
        Create notification for subscription activation
        
        Args:
            db: Database session
            user_id: ID of the user
            plan_name: Name of the plan
            
        Returns:
            Created notification
        """
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title=f"🎉 Abonnement {plan_name} activé !",
            message=f"Votre abonnement {plan_name} est maintenant actif. Profitez de tous les avantages !",
            notification_type=NotificationType.SUCCESS,
            action_url="/subscription",
            action_label="Voir mon abonnement"
        )
    
    @staticmethod
    def notify_subscription_expiring(
        db: Session,
        user_id: int,
        plan_name: str,
        days_left: int
    ) -> Notification:
        """
        Create notification for subscription expiring soon
        
        Args:
            db: Database session
            user_id: ID of the user
            plan_name: Name of the plan
            days_left: Number of days until expiration
            
        Returns:
            Created notification
        """
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title=f"⚠️ Abonnement expire bientôt",
            message=f"Votre abonnement {plan_name} expire dans {days_left} jours. Renouvelez-le pour continuer à profiter des avantages !",
            notification_type=NotificationType.WARNING,
            action_url="/subscription",
            action_label="Renouveler"
        )
    
    @staticmethod
    def notify_welcome(
        db: Session,
        user_id: int,
        user_name: str
    ) -> Notification:
        """
        Create welcome notification for new users
        
        Args:
            db: Database session
            user_id: ID of the user
            user_name: Name of the user
            
        Returns:
            Created notification
        """
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title=f"👋 Bienvenue {user_name} !",
            message="Bienvenue sur AirWeight ! Commencez à économiser sur vos bagages dès maintenant.",
            notification_type=NotificationType.SUCCESS,
            action_url="/dashboard",
            action_label="Découvrir"
        )


def get_notification_service() -> NotificationService:
    """Dependency to get notification service"""
    return NotificationService()
