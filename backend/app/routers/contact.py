from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.core.mailer import send_contact_notification
from app.core.security import get_current_admin
from app.models import ContactMessage
from app.schemas import ContactCreate, ContactOut

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/hour")
def send_message(
    request: Request,
    payload: ContactCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    # Honeypot: se responde 202 igual que a un humano para no darle pistas al bot.
    if payload.website.strip():
        return {"detail": "Message received"}

    message = ContactMessage(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
    )
    db.add(message)
    db.commit()

    if settings.notification_email:
        background.add_task(
            send_contact_notification,
            payload.name,
            payload.email,
            payload.subject,
            payload.message,
        )
    return {"detail": "Message received"}


@router.get("/messages", response_model=list[ContactOut], dependencies=[Depends(get_current_admin)])
def list_messages(db: Session = Depends(get_db)) -> list[ContactMessage]:
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


def _get_or_404(db: Session, message_id: int) -> ContactMessage:
    message = db.get(ContactMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.patch(
    "/messages/{message_id}/read",
    response_model=ContactOut,
    dependencies=[Depends(get_current_admin)],
)
def mark_read(message_id: int, db: Session = Depends(get_db)) -> ContactMessage:
    message = _get_or_404(db, message_id)
    message.is_read = True
    db.commit()
    db.refresh(message)
    return message


@router.delete(
    "/messages/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin)],
)
def delete_message(message_id: int, db: Session = Depends(get_db)) -> Response:
    db.delete(_get_or_404(db, message_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
