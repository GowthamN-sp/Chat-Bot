<<<<<<< HEAD
# 🤖 Gemini Chat — Full Stack AI Chatbot

A production-ready AI chatbot built with **React + FastAPI + Google Gemini**.

![Gemini Chat](https://via.placeholder.com/900x500/0ea5e9/ffffff?text=Gemini+Chat+Screenshot)

---

## ✨ Features

### Core
- 🧠 **Google Gemini 2.0 Flash** — fast, capable AI responses
- 💬 **Markdown rendering** with syntax-highlighted code blocks
- 📋 **Copy message / copy code** buttons
- 🗂️ **Conversation history** with auto-titling from first message
- 🔍 **Search across chats**
- 💾 **localStorage persistence** — chats survive page refresh
- 🌙 **Dark / Light mode** toggle with system-preference detection

### Advanced
- 🎤 **Speech-to-Text** via Web Speech API
- 🛑 **Stop generating** button with request cancellation
- ⚡ **Suggested prompts** on empty state
- 📤 **Export chat** to plain text
- 🏥 **Health check** with live backend status indicator
- 🔄 **Retry** last message on failure

### Technical
- Fully async FastAPI backend
- Pydantic v2 request/response validation
- CORS locked to configured origins
- Timeout handling (30s default)
- Graceful error propagation to the UI

---

## 🗂️ Project Structure

```
chatbot/
├── backend/
│   ├── main.py
│   ├── routers/chat.py
│   ├── services/gemini_service.py
│   ├── schemas/chat_schema.py
│   ├── utils/logger.py
│   ├── .env
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── context/ChatContext.jsx      ← global state (useReducer)
    │   ├── hooks/
    │   │   ├── useChatActions.js        ← send / stop / retry
    │   │   ├── useAutoScroll.js
    │   │   └── useHealth.js
    │   ├── services/api.js              ← Axios + error normalisation
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Header.jsx
    │   │   ├── ChatWindow.jsx
    │   │   ├── ChatMessage.jsx          ← Markdown + code highlighting
    │   │   ├── ChatInput.jsx            ← Speech-to-text, stop, counter
    │   │   ├── TypingIndicator.jsx
    │   │   ├── SettingsModal.jsx
    │   │   ├── ThemeToggle.jsx
    │   │   └── LoadingSpinner.jsx
    │   └── pages/ChatPage.jsx
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Google Gemini API key → https://aistudio.google.com/app/apikey

---

### Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and set your GEMINI_API_KEY
nano .env

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at → http://localhost:8000
Swagger docs → http://localhost:8000/docs

---

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at → http://localhost:5173

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
GEMINI_API_KEY=your_key_here        # Required
MAX_MESSAGE_LENGTH=4000              # Max chars per message
REQUEST_TIMEOUT=30                   # Seconds before timeout
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
APP_ENV=development
```

---

## 🏗️ Architecture

```
Browser (React)
     │
     │  POST /api/chat { message }
     ▼
FastAPI (uvicorn)
     │  Validates → calls Gemini SDK
     ▼
Google Gemini API
     │  Returns generated text
     ▼
FastAPI → { response, model, tokens_used }
     │
     ▼
React ChatWindow renders Markdown
```

---

## 🔮 Future Improvements

- [ ] Streaming responses (SSE / WebSocket)
- [ ] Multi-turn memory sent to Gemini
- [ ] Image upload (Gemini Vision)
- [ ] File upload for document Q&A
- [ ] User authentication
- [ ] PostgreSQL persistent storage
- [ ] Mobile app (React Native)
- [ ] Rate limiting & abuse protection

---

## 📄 License

MIT — build freely.
=======
# react-chatwoot
>>>>>>> a4b7ae16f59617a58f27809cda59b84a7d97f339
