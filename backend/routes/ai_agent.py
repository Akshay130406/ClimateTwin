import logging
import os
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from google import genai
from google.genai import types


router = APIRouter()
logger = logging.getLogger(__name__)


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant", "model"]
    content: str


class AssistantRequest(BaseModel):
    message: str
    history: list[HistoryMessage] = Field(default_factory=list)


@router.post("/ai-assistant")
def climate_ai_assistant(request: AssistantRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY is not configured")
        raise HTTPException(
            status_code=503,
            detail="AI assistant is temporarily unavailable."
        )

    try:
        client = genai.Client(api_key=api_key)
        history = [
            types.Content(
                role="model" if item.role == "assistant" else item.role,
                parts=[types.Part(text=item.content)],
            )
            for item in request.history
        ]
        chat = client.chats.create(
            model="gemini-3.8-flash",
            history=history,
        )
        response = chat.send_message(request.message)
        answer = (response.text or "").strip()
        if not answer:
            raise RuntimeError("Gemini returned an empty response")

        return {
            "answer": answer
        }

    except Exception:
        logger.exception("AI assistant request failed")
        raise HTTPException(
            status_code=503,
            detail="AI assistant is temporarily unavailable."
        )
