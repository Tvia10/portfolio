import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_contact_notification(name: str, email: str, subject: str, body: str) -> None:
    """Avisa por mail de un mensaje nuevo.

    Se ejecuta como BackgroundTask: si SMTP no esta configurado o falla, el
    mensaje ya quedo guardado en la base y la request del visitante no se rompe.
    """
    if not settings.smtp_host or not settings.notification_email:
        logger.info("SMTP sin configurar, se omite la notificacion de %s", email)
        return

    msg = EmailMessage()
    msg["Subject"] = f"[Portfolio] {subject or 'Nuevo mensaje'} - {name}"
    msg["From"] = settings.smtp_user or settings.notification_email
    msg["To"] = settings.notification_email
    msg["Reply-To"] = email
    msg.set_content(f"De: {name} <{email}>\n\n{body}")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            smtp.starttls()
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
    except Exception:
        logger.exception("No se pudo enviar la notificacion de contacto")
