"""
Pydantic schemas for chat request/response validation.
"""
from pydantic import BaseModel, Field, field_validator
import os


MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", "4000"))


class ChatRequest(BaseModel):
    """Incoming chat message from the user."""
    message: str = Field(
        ...,
        min_length=1,
        max_length=MAX_MESSAGE_LENGTH,
        description="User's chat message",
        examples=["Hello, how are you?"]
    )
    conversation_id: str | None = Field(
        default=None,
        description="Optional session identifier for future multi-turn support"
    )

    @field_validator("message")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or whitespace only")
        return stripped


class ChatResponse(BaseModel):
    """AI response returned to the frontend."""
    response: str = Field(..., description="Gemini's response text")
    model: str = Field(default="gemini-2.0-flash", description="Model used")
    tokens_used: int | None = Field(default=None, description="Token count if available")


class ErrorResponse(BaseModel):
    """Structured error payload."""
    detail: str
    error_type: str | None = None
