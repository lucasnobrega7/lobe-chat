import { streamText } from "ai"
import type { NextRequest } from "next/server"
import { getModelById } from "@/lib/models"
import { getUserPreference } from "@/lib/redis"

const DEMO_USER_ID = "demo-user"

export async function POST(req: NextRequest) {
  try {
    // Get API key from request header
    const apiKey = req.headers.get("x-api-key")

    // Validate API key
    const storedApiKey = await getUserPreference(DEMO_USER_ID, "apiKey", null)

    if (!apiKey || apiKey !== storedApiKey) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Extract the data from the request
    const { messages, modelId = "grok-2" } = await req.json()

    // Get the model to use
    const modelToUse = getModelById(modelId)

    if (!modelToUse) {
      return new Response(JSON.stringify({ error: "Invalid model ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Call the language model
    const result = streamText({
      model: modelToUse.model,
      messages,
    })

    // Respond with the stream or full text based on query param
    const streamResponse = req.nextUrl.searchParams.get("stream") === "true"

    if (streamResponse) {
      return result.toDataStreamResponse()
    } else {
      const text = await result.text
      return new Response(
        JSON.stringify({
          response: text,
          model: modelToUse.id,
          usage: {
            prompt_tokens: 0, // We don't have this info from AI SDK yet
            completion_tokens: 0,
            total_tokens: 0,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    console.error("Error in public chat API:", error)
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
