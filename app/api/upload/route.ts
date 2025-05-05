import { NextResponse } from "next/server"
import { uploadFile } from "@/lib/blob"
import { saveAttachment } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const chatId = formData.get("chatId") as string
    const messageId = formData.get("messageId") as string
    const userId = formData.get("userId") as string

    if (!file || !chatId || !userId) {
      return NextResponse.json({ error: "File, chatId, and userId are required" }, { status: 400 })
    }

    // Upload file to Vercel Blob
    const uploadedFile = await uploadFile(file, userId, chatId)

    // Save attachment metadata to database
    const attachment = await saveAttachment({
      message_id: messageId,
      chat_id: chatId,
      name: uploadedFile.name,
      url: uploadedFile.url,
      size: uploadedFile.size,
      type: uploadedFile.type,
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "An error occurred uploading your file" }, { status: 500 })
  }
}
