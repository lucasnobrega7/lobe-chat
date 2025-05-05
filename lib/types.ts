export type Chat = {
  id: string
  title: string
  user_id: string
  model_id: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  chat_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export type Attachment = {
  id: string
  message_id: string
  chat_id: string
  name: string
  url: string
  size: number
  type: string
  created_at: string
}

export type ModelProvider = "groq" | "grok" | "openai"

export interface ModelOption {
  id: string
  name: string
  provider: ModelProvider
  description: string
  contextLength: number
  model: any
}

export type UserSettings = {
  id: string
  user_id: string
  preferred_model: string
  theme: "light" | "dark" | "system"
  api_key?: string
  created_at: string
  updated_at: string
}
