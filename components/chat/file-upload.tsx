"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Attachment } from "@/lib/types"

interface FileUploadProps {
  chatId: string
  userId: string
  onUploadComplete: (file: Attachment) => void
}

export function FileUpload({ chatId, userId, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !chatId || !userId) return

    setIsUploading(true)
    setUploadProgress(10)

    try {
      const messageId = uuidv4()
      const formData = new FormData()
      formData.append("file", file)
      formData.append("chatId", chatId)
      formData.append("messageId", messageId)
      formData.append("userId", userId)

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
      onUploadComplete(uploadedFile)
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
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}
    </div>
  )
}
