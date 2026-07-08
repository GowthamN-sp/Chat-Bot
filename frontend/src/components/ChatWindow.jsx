/**
 * ChatWindow — the main message area.
 * Shows welcome screen if no conversation is active,
 * otherwise renders messages with auto-scroll.
 */
import { useEffect } from 'react'
import { RiRobot2Line, RiFlashlightLine, RiCodeLine, RiGlobalLine } from 'react-icons/ri'
import { useChat } from '../context/ChatContext'
import { useChatActions } from '../hooks/useChatActions'
import { useAutoScroll } from '../hooks/useAutoScroll'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

const SUGGESTED = [
  { icon: <RiFlashlightLine size={16} />, text: 'Explain quantum computing in simple terms' },
  { icon: <RiCodeLine size={16} />, text: 'Write a Python function to reverse a linked list' },
  { icon: <RiGlobalLine size={16} />, text: 'What are the top tourist spots in Bangalore?' },
  { icon: <RiRobot2Line size={16} />, text: 'How does generative AI work?' },
]

export default function ChatWindow() {
  const { activeConversation, isLoading, error, newChat } = useChat()
  const { send } = useChatActions()

  const messages = activeConversation?.messages ?? []

  // Auto-scroll whenever messages change or loading state changes
  const { ref } = useAutoScroll([messages.length, isLoading])

  // Create a new chat if there's none active when component first mounts
  useEffect(() => {
    // Don't auto-create — let user click "New Chat"
  }, [])

  const handleSuggestion = (text) => {
    if (!activeConversation) newChat()
    // Small delay to let newChat reducer settle
    setTimeout(() => send(text), 60)
  }

  return (
    <div ref={ref} className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Welcome / empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gem-500 to-blue-600 flex items-center justify-center shadow-xl shadow-gem-500/30 mb-5">
              <RiRobot2Line className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 gradient-text">Gemini Chat</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
              Powered by Google's Gemini AI. Ask me anything — coding, writing, math, or just have a conversation.
            </p>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s.text)}
                  className="
                    flex items-center gap-3 px-4 py-3 text-left
                    glass rounded-xl text-sm text-gray-700 dark:text-gray-300
                    hover:border-gem-300 dark:hover:border-gem-700
                    hover:shadow-md hover:shadow-gem-500/10
                    transition-all active:scale-[0.98]
                    border border-gray-200 dark:border-surface-600
                  "
                >
                  <span className="text-gem-500 flex-shrink-0">{s.icon}</span>
                  <span className="leading-snug">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          msg.pending && msg.content === ''
            ? <TypingIndicator key={msg.id} />
            : <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in">
            <span className="text-base">⚠️</span>
            <p>{error}</p>
          </div>
        )}

      </div>
    </div>
  )
}
