"""
Gemini AI service — wraps google-generativeai SDK.

Responsibilities
─────────────────
- Load API key from environment (never from user input)
- Send messages to Gemini with timeout + retry logic
- Return clean text or raise structured exceptions
"""
import os
import asyncio
from typing import Optional

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv

from utils.logger import logger

# Load env early so the module is self-contained
load_dotenv()

# ── Constants ────────────────────────────────────────────────────────────────
MODEL_NAME = "gemini-2.0-flash"
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "30"))

# Safety settings — adjust thresholds as needed
SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}

GENERATION_CONFIG = {
    "temperature": 0.9,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 2048,
}


class GeminiServiceError(Exception):
    """Raised when Gemini API returns an error."""
    def __init__(self, message: str, error_type: str = "gemini_error"):
        super().__init__(message)
        self.error_type = error_type


class GeminiService:
    """
    Thin wrapper around the Gemini generative model.
    Instantiated once and reused across requests (see dependency injection in router).
    """

    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.error("GEMINI_API_KEY is not set or is still the placeholder value")
            raise GeminiServiceError(
                "Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.",
                error_type="configuration_error",
            )

        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config=GENERATION_CONFIG,
            safety_settings=SAFETY_SETTINGS,
            system_instruction=(
                "You are Gemini, a helpful, creative, and knowledgeable AI assistant "
                "built by Google. Respond clearly and concisely. Use markdown formatting "
                "when it improves readability (e.g., code blocks, lists). "
                "Be friendly, accurate, and honest."
            ),
        )
        logger.info(f"GeminiService initialized — model: {MODEL_NAME}")

    async def generate_response(self, message: str) -> tuple[str, Optional[int]]:
        """
        Send a message to Gemini and return (response_text, tokens_used).

        Raises
        ------
        GeminiServiceError  on API failures, timeouts, or safety blocks.
        """
        logger.info(f"Sending message to Gemini ({len(message)} chars)")

        try:
            # Run the synchronous SDK call in a thread pool to keep FastAPI async
            loop = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(None, self._model.generate_content, message),
                timeout=REQUEST_TIMEOUT,
            )

            # Check for blocked content
            if not response.candidates:
                logger.warning("Gemini response blocked — no candidates returned")
                raise GeminiServiceError(
                    "Your message was blocked by Gemini's safety filters.",
                    error_type="safety_block",
                )

            text = response.text.strip()
            tokens: Optional[int] = None

            try:
                if response.usage_metadata:
                    tokens = (
                        response.usage_metadata.prompt_token_count
                        + response.usage_metadata.candidates_token_count
                    )
            except Exception:
                pass  # Token metadata is optional — don't crash on missing field

            logger.info(f"Gemini responded ({len(text)} chars, {tokens} tokens)")
            return text, tokens

        except asyncio.TimeoutError:
            logger.error(f"Gemini request timed out after {REQUEST_TIMEOUT}s")
            raise GeminiServiceError(
                f"Request timed out after {REQUEST_TIMEOUT} seconds. Please try again.",
                error_type="timeout",
            )
        except GeminiServiceError:
            raise  # Re-raise our own errors unchanged
        except Exception as exc:
            logger.error(f"Unexpected Gemini error: {exc}", exc_info=True)
            raise GeminiServiceError(
                # "An unexpected error occurred while contacting the AI. Please try again.",
                message=str(exc),
                error_type="api_error",
            )


# ── Module-level singleton ────────────────────────────────────────────────────
# Instantiated lazily on first import so misconfiguration is caught at startup.
_service_instance: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """FastAPI dependency — returns the shared GeminiService instance."""
    global _service_instance
    if _service_instance is None:
        _service_instance = GeminiService()
    return _service_instance
