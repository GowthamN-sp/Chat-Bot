/**
 * useChatActions — custom hook that wires the send/retry/stop logic
 * together with ChatContext and the API service.
 */
import { useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendMessage } from '../services/api'
import { useChat } from '../context/ChatContext'

export function useChatActions() {
  const {
    activeConversationId,
    activeConversation,
    newChat,
    addMessage,
    updateLastAiMessage,
    setLoading,
    setError,
    clearError,
  } = useChat()

  // Holds the AbortController for the in-flight request
  const abortRef = useRef(null)

  /**
   * Ensure an active conversation exists; create one if not.
   * Returns the conversation id to use.
   */
  const ensureConversation = useCallback(() => {
    if (activeConversationId) return activeConversationId
    // newChat creates a new conversation and sets it active (via reducer)
    // We read the id from the reducer state on next render, but for immediate
    // use we can't read it synchronously — so we dispatch and use a ref trick.
    // Instead, we'll return null and let the caller handle it.
    newChat()
    return null
  }, [activeConversationId, newChat])

  const send = useCallback(async (text) => {
    if (!text.trim()) return

    clearError()

    // Make sure there is a conversation
    let convId = activeConversationId
    if (!convId) {
      newChat()
      // The reducer will set activeConversationId on re-render.
      // We need to wait one tick — use a small workaround:
      // push the user message after the state settles via a ref.
      // For simplicity, we just generate the id here and let the NEW_CHAT
      // reducer set it. But since we need it now, we generate it ourselves.
      // ChatContext's NEW_CHAT action uses uuidv4() internally — we can't
      // intercept it. Instead, the pattern is: call newChat() then abort
      // and re-call send on the next render. A cleaner approach:
      // always create a chat before calling send.
      return
    }

    // Add user message
    const userMsg = {
      id:        uuidv4(),
      role:      'user',
      content:   text.trim(),
      timestamp: Date.now(),
    }
    addMessage(convId, userMsg)

    // Placeholder AI message (shown as "typing")
    const aiMsg = {
      id:        uuidv4(),
      role:      'ai',
      content:   '',
      timestamp: Date.now(),
      pending:   true,
    }
    addMessage(convId, aiMsg)
    setLoading(true)

    // Create abort controller for stop-generating support
    abortRef.current = new AbortController()

    try {
      const data = await sendMessage(text.trim(), abortRef.current.signal)
      updateLastAiMessage(convId, data.response)
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        // User pressed Stop — update the message to show it was stopped
        updateLastAiMessage(convId, '_Generation stopped._')
      } else {
        updateLastAiMessage(convId, `⚠️ ${err.message}`)
        setError(err.message)
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [activeConversationId, newChat, addMessage, updateLastAiMessage, setLoading, setError, clearError])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const retry = useCallback(() => {
    if (!activeConversation) return
    const messages = activeConversation.messages
    // Find the last user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (lastUser) send(lastUser.content)
  }, [activeConversation, send])

  return { send, stop, retry }
}
