from .gemini_service import GeminiService, GeminiServiceError, get_gemini_service
import os
__all__ = ["GeminiService", "GeminiServiceError", "get_gemini_service"]
api_key = os.getenv("GEMINI_API_KEY")
print("API KEY =", api_key)