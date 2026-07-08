/**
 * ChatInput — sticky input bar with:
 *   - Auto-growing textarea
 *   - Enter to send / Shift+Enter for newline
 *   - Stop generating button
 *   - Character counter
 *   - Speech-to-text toggle (Web Speech API)
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  RiSendPlaneFill, RiStopCircleLine,
  RiMicLine, RiMicOffLine,
} from 'react-icons/ri'
import { useChat } from '../context/ChatContext'
import { useChatActions } from '../hooks/useChatActions'

const MAX_CHARS = 4000

export default function ChatInput() {
  const { isLoading, activeConversationId, newChat } = useChat()
  const { send, stop } = useChatActions()

  const [value, setValue] = useState('')
  const [listening, setListening] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  // Auto-focus on mount and when conversation changes
  useEffect(() => {
    textareaRef.current?.focus()
  }, [activeConversationId])

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [value])

  const handleSend = useCallback(async () => {
    const text = value.trim()
    if (!text || isLoading) return

    // If no active conversation, create one first then send
    if (!activeConversationId) {
      newChat()
      // We need to wait for state to update — use a micro-delay
      await new Promise(r => setTimeout(r, 50))
    }

    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    send(text)
  }, [value, isLoading, activeConversationId, newChat, send])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // ── Speech-to-Text ─────────────────────────────────────────────────────────
  const toggleSpeech = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setValue(prev => prev ? prev + ' ' + transcript : transcript)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [listening])

  const remaining = MAX_CHARS - value.length
  const nearLimit  = remaining < 200
  const overLimit  = remaining < 0

  return (
    <div className="
      sticky bottom-0
      px-4 py-3
      bg-white/90 dark:bg-surface-900/90 backdrop-blur-md
      border-t border-gray-200 dark:border-surface-700
    ">
      <div className="max-w-3xl mx-auto">
        {/* Input container */}
        <div className={`
          relative flex items-end gap-2
          bg-white dark:bg-surface-700
          border rounded-2xl shadow-lg shadow-black/5
          transition-all
          ${overLimit
            ? 'border-red-400 dark:border-red-500'
            : 'border-gray-200 dark:border-surface-600 focus-within:border-gem-400 dark:focus-within:border-gem-500 focus-within:shadow-gem-500/10 focus-within:shadow-xl'
          }
        `}>
          {/* Mic button */}
          <button
            onClick={toggleSpeech}
            title={listening ? 'Stop listening' : 'Speech to text'}
            className={`
              flex-shrink-0 ml-3 mb-3 p-1.5 rounded-lg transition-colors
              ${listening
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse'
                : 'text-gray-400 dark:text-gray-500 hover:text-gem-500 hover:bg-gem-50 dark:hover:bg-gem-900/20'
              }
            `}
          >
            {listening ? <RiMicLine size={18} /> : <RiMicOffLine size={18} />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Gemini… (Enter to send, Shift+Enter for new line)"
            rows={1}
            maxLength={MAX_CHARS + 100}
            disabled={isLoading}
            className="
              flex-1 py-3 pr-2 bg-transparent resize-none
              text-sm text-gray-800 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none
              disabled:opacity-50
              max-h-40 leading-relaxed
            "
          />

          {/* Send / Stop button */}
          <div className="flex-shrink-0 mr-2 mb-2">
            {isLoading ? (
              <button
                onClick={stop}
                title="Stop generating"
                className="
                  p-2 rounded-xl bg-red-100 dark:bg-red-900/30
                  text-red-500 dark:text-red-400
                  hover:bg-red-200 dark:hover:bg-red-900/50
                  transition-all active:scale-95
                "
              >
                <RiStopCircleLine size={18} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!value.trim() || overLimit}
                title="Send message"
                className="
                  p-2 rounded-xl transition-all active:scale-95
                  disabled:opacity-40 disabled:cursor-not-allowed
                  bg-gem-600 hover:bg-gem-700
                  text-white shadow-md shadow-gem-600/30
                "
              >
                <RiSendPlaneFill size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            Shift + Enter for new line
          </p>
          <p className={`text-[10px] ${nearLimit ? (overLimit ? 'text-red-500' : 'text-amber-500') : 'text-gray-400 dark:text-gray-500'}`}>
            {remaining.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
