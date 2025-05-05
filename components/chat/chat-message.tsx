import { Card } from "@/components/ui/card"
import { FilePreview } from "./file-preview"
import type { Message, Attachment } from "@/lib/types"

interface ChatMessageProps {
  message: Message
  attachments: Attachment[]
}

export function ChatMessage({ message, attachments }: ChatMessageProps) {
  return (
    <Card
      className={`p-4 max-w-3xl ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto"}`}
    >
      <div className="flex">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
          {message.role === "user" ? "U" : "AI"}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{message.role === "user" ? "You" : "Assistant"}</p>
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Display attachments if any */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <FilePreview file={attachment} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
