"use client"

import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, Film, Music, File, X } from "lucide-react"
import type { Attachment } from "@/lib/types"

interface FilePreviewProps {
  file: Attachment
  onRemove?: () => void
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const getFileIcon = () => {
    const type = file.type || ""

    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.startsWith("video/")) return <Film className="h-5 w-5" />
    if (type.startsWith("audio/")) return <Music className="h-5 w-5" />
    if (type.startsWith("text/") || type.includes("document")) return <FileText className="h-5 w-5" />

    return <File className="h-5 w-5" />
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      {onRemove && (
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      )}
    </div>
  )
}
