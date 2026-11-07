import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai_agent.climate_assistant import ask_climate_assistant


router = APIRouter()
logger = logging.getLogger(__name__)


class AssistantRequest(BaseModel):
    question: str


@router.post("/ai-assistant")
def climate_ai_assistant(request: AssistantRequest):

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:
        answer = ask_climate_assistant(
            request.question
        )

        return {
            "question": request.question,
            "answer": answer
        }

    except Exception:
        logger.exception("AI assistant request failed")
        raise HTTPException(
            status_code=503,
            detail="AI assistant is temporarily unavailable."
        )
