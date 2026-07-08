/**
 * ChatContext — global state management for conversations, theme, and settings.
 * Uses Context API + useReducer for predictable state updates.
 * Persists conversations and theme to localStorage.
 */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY   = 'gemini_chat_conversations'
const THEME_KEY     = 'gemini_chat_theme'
const MAX_HISTORY   = 50   // max conversations stored

// ── Initial state ─────────────────────────────────────────────────────────────
const createConversation = (title = 'New Chat') => ({
  id:        uuidv4(),
  title,
  messages:  [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const loadTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

const initialState = {
  conversations:       loadFromStorage(),
  activeConversationId: null,
  isLoading:           false,
  error:               null,
  theme:               loadTheme(),
  sidebarOpen:         true,
  searchQuery:         '',
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function chatReducer(state, action) {
  switch (action.type) {

    case 'NEW_CHAT': {
      const conv = createConversation()
      return {
        ...state,
        conversations: [conv, ...state.conversations].slice(0, MAX_HISTORY),
        activeConversationId: conv.id,
        error: null,
      }
    }

    case 'SELECT_CONVERSATION':
      return { ...state, activeConversationId: action.id, error: null }

    case 'DELETE_CONVERSATION': {
      const remaining = state.conversations.filter(c => c.id !== action.id)
      const nextActive = state.activeConversationId === action.id
        ? (remaining[0]?.id ?? null)
        : state.activeConversationId
      return { ...state, conversations: remaining, activeConversationId: nextActive }
    }

    case 'CLEAR_ALL':
      return { ...state, conversations: [], activeConversationId: null }

    case 'ADD_MESSAGE': {
      const { conversationId, message } = action
      const updated = state.conversations.map(c => {
        if (c.id !== conversationId) return c
        const messages = [...c.messages, message]
        // Auto-title from first user message
        const title = c.title === 'New Chat' && message.role === 'user'
          ? message.content.slice(0, 40) + (message.content.length > 40 ? '…' : '')
          : c.title
        return { ...c, messages, title, updatedAt: Date.now() }
      })
      return { ...state, conversations: updated }
    }

    case 'UPDATE_LAST_AI_MESSAGE': {
      const { conversationId, content } = action
      const updated = state.conversations.map(c => {
        if (c.id !== conversationId) return c
        const messages = [...c.messages]
        const lastIdx  = messages.length - 1
        if (lastIdx >= 0 && messages[lastIdx].role === 'ai') {
          messages[lastIdx] = { ...messages[lastIdx], content, updatedAt: Date.now() }
        }
        return { ...c, messages, updatedAt: Date.now() }
      })
      return { ...state, conversations: updated }
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.value }

    case 'SET_ERROR':
      return { ...state, error: action.message, isLoading: false }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    case 'TOGGLE_THEME': {
      const theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, theme)
      return { ...state, theme }
    }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  // Persist conversations to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations))
    } catch { /* quota exceeded — silently skip */ }
  }, [state.conversations])

  // Apply dark/light class to <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  // ── Derived values ─────────────────────────────────────────────────────────
  const activeConversation = state.conversations.find(
    c => c.id === state.activeConversationId
  ) ?? null

  const filteredConversations = state.searchQuery
    ? state.conversations.filter(c =>
        c.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(state.searchQuery.toLowerCase()))
      )
    : state.conversations

  // ── Actions ────────────────────────────────────────────────────────────────
  const newChat         = useCallback(() => dispatch({ type: 'NEW_CHAT' }), [])
  const selectChat      = useCallback(id => dispatch({ type: 'SELECT_CONVERSATION', id }), [])
  const deleteChat      = useCallback(id => dispatch({ type: 'DELETE_CONVERSATION', id }), [])
  const clearAll        = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), [])
  const setLoading      = useCallback(v  => dispatch({ type: 'SET_LOADING', value: v }), [])
  const setError        = useCallback(msg => dispatch({ type: 'SET_ERROR', message: msg }), [])
  const clearError      = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])
  const toggleTheme     = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), [])
  const toggleSidebar   = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), [])
  const setSearch       = useCallback(q  => dispatch({ type: 'SET_SEARCH', query: q }), [])

  const addMessage = useCallback((conversationId, message) => {
    dispatch({ type: 'ADD_MESSAGE', conversationId, message })
  }, [])

  const updateLastAiMessage = useCallback((conversationId, content) => {
    dispatch({ type: 'UPDATE_LAST_AI_MESSAGE', conversationId, content })
  }, [])

  const value = {
    ...state,
    activeConversation,
    filteredConversations,
    // Actions
    newChat, selectChat, deleteChat, clearAll,
    addMessage, updateLastAiMessage,
    setLoading, setError, clearError,
    toggleTheme, toggleSidebar, setSearch,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within <ChatProvider>')
  return ctx
}
