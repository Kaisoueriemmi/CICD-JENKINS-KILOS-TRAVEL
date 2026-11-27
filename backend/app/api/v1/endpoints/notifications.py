"""
Notifications API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.models import Notification, User
from app.schemas.schemas import (
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
    NotificationListResponse
)
from app.api.v1.endpoints.auth import get_current_user
from app.middleware.rate_limit import limiter, get_rate_limit
from datetime import datetime
from typing import Optional

router = APIRouter()


@router.get("/", response_model=NotificationListResponse)
@limiter.limit(get_rate_limit("read_resource"))
async def get_notifications(
    request: Request,
    skip: int = 0,
    limit: int = 20,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user notifications with pagination

    Args:
        skip: Number of notifications to skip
        limit: Maximum number of notifications to return
        unread_only: If True, return only unread notifications
        current_user: Current authenticated user
        db: Database session

    Returns:
        List of notifications with total count and unread count
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    # Get total count
    total = query.count()

    # Get unread count
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    # Get notifications with pagination
    notifications = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    return NotificationListResponse(
        notifications=notifications,
        total=total,
        unread_count=unread_count
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
@limiter.limit(get_rate_limit("read_resource"))
async def get_notification(
    request: Request,
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific notification by ID

    Args:
        notification_id: ID of the notification
        current_user: Current authenticated user
        db: Database session

    Returns:
        Notification details
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return notification


@router.patch("/{notification_id}", response_model=NotificationResponse)
@limiter.limit(get_rate_limit("api_general"))
async def update_notification(
    request: Request,
    notification_id: int,
    notification_update: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a notification (mark as read/unread)

    Args:
        notification_id: ID of the notification
        notification_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Update notification
    if notification_update.is_read is not None:
        notification.is_read = notification_update.is_read
        if notification_update.is_read:
            notification.read_at = datetime.utcnow()
        else:
            notification.read_at = None

    db.commit()
    db.refresh(notification)

    return notification


@router.post("/mark-all-read", response_model=dict)
@limiter.limit(get_rate_limit("api_general"))
async def mark_all_read(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read for the current user

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message with count of marked notifications
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })

    db.commit()

    return {
        "message": f"{count} notifications marked as read",
        "count": count
    }


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(get_rate_limit("api_general"))
async def delete_notification(
    request: Request,
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notification

    Args:
        notification_id: ID of the notification
        current_user: Current authenticated user
        db: Database session
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return None


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(get_rate_limit("api_general"))
async def delete_all_notifications(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete all notifications for the current user

    Args:
        current_user: Current authenticated user
        db: Database session
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete()

    db.commit()

    return None


@router.get("/unread/count", response_model=dict)
@limiter.limit(get_rate_limit("read_resource"))
async def get_unread_count(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Count of unread notifications
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {"unread_count": count}
