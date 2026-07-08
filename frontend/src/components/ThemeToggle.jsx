import { RiSunLine, RiMoonLine } from 'react-icons/ri'
import { useChat } from '../context/ChatContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useChat()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        p-2 rounded-lg
        text-gray-500 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-surface-700
        transition-colors
      "
    >
      {isDark
        ? <RiSunLine size={18} className="text-amber-400" />
        : <RiMoonLine size={18} className="text-indigo-500" />
      }
    </button>
  )
}
