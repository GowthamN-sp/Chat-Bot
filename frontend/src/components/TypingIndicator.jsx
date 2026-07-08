/**
 * TypingIndicator — animated "Gemini is thinking…" indicator.
 */
import { RiRobot2Line } from 'react-icons/ri'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gem-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow shadow-gem-500/30">
        <RiRobot2Line size={13} className="text-white" />
      </div>

      {/* Bubble */}
      <div className="bubble-ai flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="typing-dot w-2 h-2 rounded-full bg-gem-400 dark:bg-gem-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-gem-400 dark:bg-gem-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-gem-400 dark:bg-gem-400 inline-block" />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">Gemini is thinking…</span>
      </div>
    </div>
  )
}
