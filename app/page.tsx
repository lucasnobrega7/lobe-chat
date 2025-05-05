import { ProtectedRoute } from "@/components/auth/protected-route"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function Home() {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  )
}
