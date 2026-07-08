/**
 * App.jsx — root component.
 * Wraps the app in ChatProvider and renders the ChatPage.
 */
import { ChatProvider } from './context/ChatContext'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  )
}
