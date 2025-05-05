import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"
import type { ModelOption } from "./types"

export const models: ModelOption[] = [
  {
    id: "grok-2",
    name: "Grok-2",
    provider: "grok",
    description: "xAI's flagship model for general purpose tasks",
    contextLength: 8192,
    model: xai("grok-2-1212"),
  },
  {
    id: "llama-3-8b",
    name: "Llama 3 8B",
    provider: "groq",
    description: "Fast and efficient language model for text generation",
    contextLength: 8192,
    model: groq("llama-3.1-8b-instant"),
  },
  {
    id: "llama-3-70b",
    name: "Llama 3 70B",
    provider: "groq",
    description: "Powerful language model with strong reasoning capabilities",
    contextLength: 8192,
    model: groq("llama-3.1-70b-instant"),
  },
]

export function getModelById(id: string): ModelOption | undefined {
  return models.find((model) => model.id === id)
}
