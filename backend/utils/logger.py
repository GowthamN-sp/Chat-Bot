"""
Centralized logging configuration for the chatbot backend.
"""
import logging
import sys
from datetime import datetime


def setup_logger(name: str = "chatbot") -> logging.Logger:
    """
    Configure and return a logger with structured console output.
    In production, swap the StreamHandler for a file/JSON handler.
    """
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # Avoid duplicate handlers on reload

    logger.setLevel(logging.DEBUG)

    # ── Console handler ──────────────────────────────────────────
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)

    fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(fmt)
    logger.addHandler(handler)

    return logger


# Singleton logger used across the app
logger = setup_logger("chatbot")
