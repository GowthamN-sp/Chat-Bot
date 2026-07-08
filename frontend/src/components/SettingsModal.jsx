/**
 * SettingsModal — app settings: theme, clear history, about.
 */
import { RiCloseLine, RiDeleteBinLine, RiInformationLine } from 'react-icons/ri'
import { useChat } from '../context/ChatContext'
import ThemeToggle from './ThemeToggle'

export default function SettingsModal({ onClose }) {
  const { conversations, clearAll, theme } = useChat()

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up border border-white/20 dark:border-surface-600/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-base">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Settings rows */}
        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Appearance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Currently: {theme === 'dark' ? 'Dark' : 'Light'} mode
              </p>
            </div>
            <ThemeToggle />
          </div>

          <hr className="border-gray-200 dark:border-surface-700" />

          {/* Storage info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Stored Chats</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved locally
              </p>
            </div>
            <button
              onClick={() => { clearAll(); onClose() }}
              disabled={conversations.length === 0}
              className="
                flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg
                text-red-500 border border-red-200 dark:border-red-800
                hover:bg-red-50 dark:hover:bg-red-900/20
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
            >
              <RiDeleteBinLine size={13} />
              Clear All
            </button>
          </div>

          <hr className="border-gray-200 dark:border-surface-700" />

          {/* About */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gem-50 dark:bg-gem-900/20 border border-gem-100 dark:border-gem-800/30">
            <RiInformationLine size={16} className="text-gem-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gem-700 dark:text-gem-300">Gemini Chat v1.0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Powered by Google Gemini 2.0 Flash. Conversations are saved in your browser's localStorage — they never leave your device unless you export them.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2 text-sm rounded-xl bg-gem-600 text-white hover:bg-gem-700 transition-colors font-medium"
        >
          Done
        </button>
      </div>
    </div>
  )
}
