"""
Chat router — exposes POST /chat endpoint.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from schemas.chat_schema import ChatRequest, ChatResponse, ErrorResponse
from services.gemini_service import GeminiService, GeminiServiceError, get_gemini_service
from utils.logger import logger

router = APIRouter(prefix="/api", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad request / validation error"},
        429: {"model": ErrorResponse, "description": "Rate limit hit"},
        500: {"model": ErrorResponse, "description": "AI service error"},
        503: {"model": ErrorResponse, "description": "Service unavailable"},
    },
    summary="Send a message and receive an AI response",
)
async def chat(
    request: Request,
    body: ChatRequest,
    gemini: GeminiService = Depends(get_gemini_service),
) -> ChatResponse:
    """
    Accepts a user message and returns a response from Google Gemini.

    - **message**: The user's text (1–4000 chars, leading/trailing whitespace stripped)
    - **conversation_id**: Optional session ID (reserved for future multi-turn support)
    """
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"POST /chat | ip={client_ip} | msg_len={len(body.message)}")

    try:
        text, tokens = await gemini.generate_response(body.message)
        return ChatResponse(response=text, tokens_used=tokens)

    except GeminiServiceError as exc:
        error_type = exc.error_type

        if error_type == "configuration_error":
            logger.critical("Gemini API key not configured")
            raise HTTPException(status_code=503, detail=str(exc))

        if error_type == "timeout":
            raise HTTPException(status_code=504, detail=str(exc))

        if error_type == "safety_block":
            raise HTTPException(status_code=400, detail=str(exc))

        raise HTTPException(status_code=500, detail=str(exc))

    except Exception as exc:
        logger.error(f"Unhandled error in /chat: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An internal server error occurred. Please try again.",
        )


@router.get("/health", summary="Health check")
async def health() -> dict:
    """Quick liveness probe used by the frontend to check connectivity."""
    return {"status": "ok", "service": "gemini-chatbot"}
