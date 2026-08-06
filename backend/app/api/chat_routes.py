"""
Per-report "Ask AI" chat endpoints.

Each conversation is scoped to one `analysis_id` (Feature 6: separate chat
history per report). On every message, the full report + athlete context is
rebuilt as the system prompt and the stored prior turns for *this report
only* are replayed to the model, which is what gives it memory of the
report within a session (Feature 5) without the frontend needing to resend
anything but the new message.

Authorization reuses the same visibility rule as /history (Feature 11:
users must never reach another user's reports).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.chat_schemas import ChatMessageOut, ChatSendRequest
from app.api.history_routes import _scoped_query
from app.api.routes import _load_result
from app.auth.dependencies import get_current_user
from app.core.ai_assistant import AIAssistantError, AIAssistantNotConfigured, ask, build_system_prompt
from app.db.database import get_db
from app.db.models import AnalysisHistory, Athlete, ChatMessage, User

router = APIRouter(prefix="/chat", tags=["AI Assistant"])


def _get_authorized_history_row(db: Session, current_user: User, analysis_id: str) -> AnalysisHistory:
    row = _scoped_query(db, current_user).filter(AnalysisHistory.id == analysis_id).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return row


@router.get("/{analysis_id}/messages", response_model=list[ChatMessageOut])
def list_messages(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_authorized_history_row(db, current_user, analysis_id)
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.analysis_id == analysis_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [ChatMessageOut.model_validate(r) for r in rows]


@router.post("/{analysis_id}/messages", response_model=ChatMessageOut)
async def send_message(
    analysis_id: str,
    payload: ChatSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history_row = _get_authorized_history_row(db, current_user, analysis_id)
    result = _load_result(analysis_id)  # full AnalysisResult JSON (raises 404 if missing)
    athlete = db.get(Athlete, history_row.athlete_id) if history_row.athlete_id else None

    prior_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.analysis_id == analysis_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    system_prompt = build_system_prompt(result, athlete, history_row.user_role)

    try:
        reply_text = await ask(system_prompt, prior_messages, payload.message)
    except AIAssistantNotConfigured as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except AIAssistantError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    user_msg = ChatMessage(analysis_id=analysis_id, user_id=current_user.id, role="user", content=payload.message)
    assistant_msg = ChatMessage(
        analysis_id=analysis_id, user_id=current_user.id, role="assistant", content=reply_text
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatMessageOut.model_validate(assistant_msg)
