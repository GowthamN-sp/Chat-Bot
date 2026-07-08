/**
 * Header — top bar showing model name, online status, and sidebar toggle.
 */
import { RiRobot2Line, RiMenuLine } from 'react-icons/ri'
import { useChat } from '../context/ChatContext'
import { useHealth } from '../hooks/useHealth'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { toggleSidebar, sidebarOpen } = useChat()
  const { isOnline } = useHealth()

  const statusColor = isOnline === null
    ? 'bg-amber-400 animate-pulse'
    : isOnline ? 'bg-emerald-400' : 'bg-red-400'

  const statusText = isOnline === null ? 'Connecting…'
    : isOnline ? 'Online' : 'Offline'

  return (
    <header className="
      flex items-center justify-between
      px-4 py-3
      border-b border-gray-200 dark:border-surface-700
      bg-white/80 dark:bg-surface-800/80 backdrop-blur-md
      z-10 sticky top-0
    ">
      {/* Left: sidebar toggle + branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="
            p-2 rounded-lg text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-surface-700
            transition-colors
          "
        >
          <RiMenuLine size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="
            w-8 h-8 rounded-xl
            bg-gradient-to-br from-gem-500 to-blue-600
            flex items-center justify-center shadow-md shadow-gem-500/30
          ">
            <RiRobot2Line className="text-white" size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none gradient-text">Gemini Chat</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
              gemini-2.0-flash
            </p>
          </div>
        </div>
      </div>

      {/* Right: status + theme */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
            {statusText}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
