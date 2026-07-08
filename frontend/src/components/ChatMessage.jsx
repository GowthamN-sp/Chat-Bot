/**
 * ChatMessage — renders a single message bubble with:
 *   - Markdown + GFM support
 *   - Syntax-highlighted code blocks with copy button
 *   - Copy whole message button
 *   - Timestamp
 */
import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { RiRobot2Line, RiUser3Line, RiFileCopyLine, RiCheckLine } from 'react-icons/ri'
import { useChat } from '../context/ChatContext'

// ── Utility ───────────────────────────────────────────────────────────────────
function useCopy(text) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available in all environments
    }
  }, [text])
  return { copied, copy }
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// ── Code block renderer ───────────────────────────────────────────────────────
function CodeBlock({ language, children, isDark }) {
  const code = String(children).replace(/\n$/, '')
  const { copied, copy } = useCopy(code)

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-surface-600 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-surface-600 border-b border-gray-200 dark:border-surface-500">
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {copied
            ? <><RiCheckLine size={13} className="text-emerald-500" /> Copied</>
            : <><RiFileCopyLine size={13} /> Copy</>
          }
        </button>
      </div>

      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.75rem', background: 'transparent' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatMessage({ message }) {
  const { theme } = useChat()
  const isDark = theme === 'dark'
  const isUser = message.role === 'user'
  const { copied, copy } = useCopy(message.content)

  const avatar = isUser
    ? (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center flex-shrink-0">
        <RiUser3Line size={13} className="text-white" />
      </div>
    ) : (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gem-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow shadow-gem-500/30">
        <RiRobot2Line size={13} className="text-white" />
      </div>
    )

  return (
    <div className={`flex items-end gap-2 group animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {avatar}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1 max-w-[85%]`}>
        <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose-chat text-sm break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <CodeBlock language={match[1]} isDark={isDark}>
                        {children}
                      </CodeBlock>
                    ) : (
                      <code
                        className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-surface-600 font-mono text-xs text-rose-500 dark:text-rose-400"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.content || '…'}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp + copy */}
        <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {!message.pending && (
            <button
              onClick={copy}
              title="Copy message"
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            >
              {copied
                ? <RiCheckLine size={12} className="text-emerald-500" />
                : <RiFileCopyLine size={12} className="text-gray-400 dark:text-gray-500" />
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
