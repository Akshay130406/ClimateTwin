from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai_agent.climate_assistant import ask_climate_assistant


router = APIRouter()


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

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=str(error)
        )