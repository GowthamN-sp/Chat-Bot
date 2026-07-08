/**
 * ChatPage — composes Sidebar + Header + ChatWindow + ChatInput.
 */
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import ChatWindow from '../components/ChatWindow'
import ChatInput from '../components/ChatInput'

export default function ChatPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-surface-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        {/* Scrollable messages */}
        <ChatWindow />

        {/* Sticky input */}
        <ChatInput />
      </div>
    </div>
  )
}
