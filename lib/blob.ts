import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export async function uploadFile(file: File, userId: string, chatId: string) {
  try {
    const fileId = uuidv4()
    const filename = `${userId}/${chatId}/${fileId}-${file.name}`

    const blob = await put(filename, file, {
      access: "public",
    })

    return {
      id: fileId,
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}
