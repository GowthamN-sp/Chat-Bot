/**
 * Sidebar — chat history, new chat, search, settings, and clear all.
 */
import { useState } from 'react'
import {
  RiAddLine, RiSearchLine, RiDeleteBinLine,
  RiRobot2Line, RiChat3Line, RiSettings3Line,
  RiDownloadLine, RiCloseLine,
} from 'react-icons/ri'
import { useChat } from '../context/ChatContext'
import SettingsModal from './SettingsModal'

export default function Sidebar() {
  const {
    filteredConversations,
    activeConversationId,
    sidebarOpen,
    newChat,
    selectChat,
    deleteChat,
    clearAll,
    setSearch,
    searchQuery,
  } = useChat()

  const [showSettings, setShowSettings] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (!sidebarOpen) return null

  const exportChat = (conv) => {
    const text = conv.messages
      .map(m => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join('\n\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${conv.title.slice(0, 30)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <aside className="
        w-64 flex-shrink-0
        flex flex-col
        bg-gray-50 dark:bg-surface-800
        border-r border-gray-200 dark:border-surface-700
        h-full overflow-hidden
      ">
        {/* Logo + New Chat */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gem-500 to-blue-600 flex items-center justify-center shadow-md shadow-gem-500/30">
              <RiRobot2Line className="text-white" size={16} />
            </div>
            <span className="font-bold text-base gradient-text">Gemini Chat</span>
          </div>

          <button
            onClick={newChat}
            className="
              w-full flex items-center gap-2 px-3 py-2.5
              bg-gem-600 hover:bg-gem-700
              text-white text-sm font-medium
              rounded-xl transition-all
              shadow-md shadow-gem-600/30
              active:scale-[0.98]
            "
          >
            <RiAddLine size={18} />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <RiSearchLine
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="
                w-full pl-8 pr-3 py-2 text-xs rounded-lg
                bg-white dark:bg-surface-700
                border border-gray-200 dark:border-surface-600
                text-gray-700 dark:text-gray-300
                placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-gem-500/50
                transition
              "
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <RiChat3Line className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={28} />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {searchQuery ? 'No results found' : 'No chats yet'}
              </p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConversationId}
                onSelect={() => selectChat(conv.id)}
                onDelete={() => deleteChat(conv.id)}
                onExport={() => exportChat(conv)}
              />
            ))
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-200 dark:border-surface-700 space-y-1">
          <button
            onClick={() => setShowSettings(true)}
            className="
              w-full flex items-center gap-2 px-3 py-2
              text-sm text-gray-600 dark:text-gray-400
              hover:bg-gray-200 dark:hover:bg-surface-700
              rounded-lg transition-colors
            "
          >
            <RiSettings3Line size={16} />
            Settings
          </button>

          {filteredConversations.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-sm text-red-500 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20
                rounded-lg transition-colors
              "
            >
              <RiDeleteBinLine size={16} />
              Clear All Chats
            </button>
          )}
        </div>
      </aside>

      {/* Clear all confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="font-semibold text-base mb-2">Clear all chats?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              This will permanently delete all conversations. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-surface-600 hover:bg-gray-50 dark:hover:bg-surface-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearAll(); setShowClearConfirm(false) }}
                className="flex-1 px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}

// ── Sub-component: single conversation item ───────────────────────────────────
function ConvItem({ conv, isActive, onSelect, onDelete, onExport }) {
  const [hover, setHover] = useState(false)
  const date = new Date(conv.updatedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric'
  })

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      className={`
        group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all select-none
        ${isActive
          ? 'bg-gem-100 dark:bg-gem-900/30 border border-gem-200 dark:border-gem-800/50'
          : 'hover:bg-gray-200 dark:hover:bg-surface-700'
        }
      `}
    >
      <RiChat3Line
        size={14}
        className={isActive ? 'text-gem-600 dark:text-gem-400 flex-shrink-0' : 'text-gray-400 flex-shrink-0'}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-xs truncate font-medium ${isActive ? 'text-gem-700 dark:text-gem-300' : 'text-gray-700 dark:text-gray-300'}`}>
          {conv.title}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">{date}</p>
      </div>

      {/* Actions shown on hover */}
      {hover && (
        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={onExport}
            title="Export chat"
            className="p-1 rounded hover:bg-gray-300 dark:hover:bg-surface-600 transition-colors"
          >
            <RiDownloadLine size={13} className="text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            title="Delete chat"
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <RiCloseLine size={13} className="text-red-400" />
          </button>
        </div>
      )}
    </div>
  )
}
