import { streamText } from "ai"
import { getModelById } from "@/lib/models"
import { saveMessage } from "@/lib/db"
import { checkRateLimit } from "@/lib/redis"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Extract the data from the request
    const { messages, chatId, modelId, userId } = await req.json()

    // Check rate limit
    const withinLimit = await checkRateLimit(userId)
    if (!withinLimit) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Get the model to use
    const modelToUse = getModelById(modelId)

    if (!modelToUse) {
      return NextResponse.json({ error: "Invalid model ID" }, { status: 400 })
    }

    // Save the user message to the database
    if (chatId && userId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "user") {
        await saveMessage({
          chat_id: chatId,
          role: "user",
          content: lastMessage.content,
        })
      }
    }

    // Call the language model
    const result = streamText({
      model: modelToUse.model,
      messages,
    })

    // Store the assistant response in the database when the stream completes
    result.text.then(async (text) => {
      if (chatId && userId) {
        await saveMessage({
          chat_id: chatId,
          role: "assistant",
          content: text,
        })
      }
    })

    // Respond with the stream
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "An error occurred processing your request" }, { status: 500 })
  }
}
