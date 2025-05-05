"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, FileText, ImageIcon, Film, Music, File } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface FileUploadProps {
  chatId: string
  onUploadComplete: (file: any) => void
}

export function FileUpload({ chatId, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !chatId) return

    setIsUploading(true)
    setUploadProgress(10)

    try {
      const messageId = uuidv4()
      const formData = new FormData()
      formData.append("file", file)
      formData.append("chatId", chatId)
      formData.append("messageId", messageId)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      setUploadProgress(100)
      const uploadedFile = await response.json()
      onUploadComplete({ ...uploadedFile, messageId })
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset the input
      e.target.value = ""
    }
  }

  return (
    <div>
      <input type="file" id="file-upload" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
      <label htmlFor="file-upload">
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" disabled={isUploading} asChild>
          <span>
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </span>
        </Button>
      </label>

      {isUploading && (
        <div className="mt-2">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}
    </div>
  )
}

export function FilePreview({ file, onRemove }: { file: any; onRemove?: () => void }) {
  const getFileIcon = () => {
    const type = file.type || ""

    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.startsWith("video/")) return <Film className="h-5 w-5" />
    if (type.startsWith("audio/")) return <Music className="h-5 w-5" />
    if (type.startsWith("text/") || type.includes("document")) return <FileText className="h-5 w-5" />

    return <File className="h-5 w-5" />
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-gray-100">
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
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
