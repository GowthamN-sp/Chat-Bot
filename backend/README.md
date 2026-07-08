# Gemini Chatbot — Backend

FastAPI backend for the AI Chatbot powered by Google Gemini 2.0 Flash.

---

## Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Framework   | FastAPI + Uvicorn              |
| AI          | Google Gemini 2.0 Flash        |
| Validation  | Pydantic v2                    |
| Config      | python-dotenv                  |
| Logging     | Python stdlib logging          |

---

## Folder Structure

```
backend/
├── main.py                  # App entry point, CORS, lifespan hooks
├── routers/
│   └── chat.py              # POST /api/chat, GET /api/health
├── services/
│   └── gemini_service.py    # Gemini SDK wrapper with timeout + error handling
├── schemas/
│   └── chat_schema.py       # Pydantic request/response models
├── utils/
│   └── logger.py            # Centralized logging setup
├── models/                  # Reserved for ORM models (future)
├── .env                     # Environment variables (never commit this)
└── requirements.txt
```

---

## Setup

### 1. Create virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create your `.env` file

Copy the template and fill in your API key:

```bash
cp .env .env.local
```

Edit `.env`:

```env
GEMINI_API_KEY=your_actual_key_here
MAX_MESSAGE_LENGTH=4000
REQUEST_TIMEOUT=30
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Get your free Gemini API key at → https://aistudio.google.com/app/apikey

### 4. Run the backend

```bash
uvicorn main:app --reload --port 8000
```

---

## API Endpoints

| Method | Path          | Description                 |
|--------|---------------|-----------------------------|
| POST   | `/api/chat`   | Send message, get AI reply  |
| GET    | `/api/health` | Backend health check        |
| GET    | `/docs`       | Swagger UI (auto-generated) |
| GET    | `/redoc`      | ReDoc UI                    |

### POST /api/chat

**Request:**
```json
{ "message": "Hello, who are you?" }
```

**Response:**
```json
{
  "response": "Hi! I'm Gemini, Google's AI...",
  "model": "gemini-2.0-flash",
  "tokens_used": 42
}
```

**Error responses:**

| Status | Meaning                                 |
|--------|-----------------------------------------|
| 400    | Message empty / safety filter blocked   |
| 422    | Validation error (too long etc.)        |
| 500    | Internal / Gemini API error             |
| 503    | API key not configured                  |
| 504    | Request timed out                       |

---

## Security

- API key is loaded from `.env` only — never exposed to the frontend
- Input validation via Pydantic (length, whitespace stripping)
- CORS restricted to configured origins
- Safety filters enabled for Gemini responses

---

## Future Improvements

- [ ] Multi-turn conversation history sent to Gemini
- [ ] Streaming responses (Server-Sent Events)
- [ ] Rate limiting per IP (slowapi)
- [ ] PostgreSQL + SQLAlchemy for persistent chat history
- [ ] Redis caching for repeated queries
- [ ] Authentication (JWT)
