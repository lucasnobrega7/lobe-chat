import { supabase } from "./supabase"
import { cacheMessages, getCachedMessages, cacheUserSettings, getCachedUserSettings } from "./redis"
import type { Chat, Message, Attachment, UserSettings } from "./types"

// Chat operations
export async function createChat(userId: string, title: string, modelId: string): Promise<Chat> {
  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id: userId,
      title,
      model_id: modelId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("chats")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId)

  if (error) throw error
}

export async function deleteChat(chatId: string): Promise<void> {
  // First delete all messages and attachments
  await supabase.from("attachments").delete().eq("chat_id", chatId)
  await supabase.from("messages").delete().eq("chat_id", chatId)

  // Then delete the chat
  const { error } = await supabase.from("chats").delete().eq("id", chatId)
  if (error) throw error
}

// Message operations
export async function getChatMessages(chatId: string): Promise<Message[]> {
  // Try to get from cache first
  const cachedMessages = await getCachedMessages(chatId)
  if (cachedMessages) return cachedMessages

  // If not in cache, get from database
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  if (error) throw error

  // Cache the messages for future requests
  await cacheMessages(chatId, data || [])

  return data || []
}

export async function saveMessage(message: Partial<Message>): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      ...message,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Update chat's updated_at timestamp
  await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", message.chat_id)

  // Invalidate cache
  const allMessages = await getChatMessages(message.chat_id!)
  await cacheMessages(message.chat_id!, allMessages)

  return data
}

// Attachment operations
export async function saveAttachment(attachment: Partial<Attachment>): Promise<Attachment> {
  const { data, error } = await supabase
    .from("attachments")
    .insert({
      ...attachment,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChatAttachments(chatId: string): Promise<Attachment[]> {
  const { data, error } = await supabase.from("attachments").select("*").eq("chat_id", chatId)

  if (error) throw error
  return data || []
}

// User settings operations
export async function getUserSettings(userId: string): Promise<UserSettings> {
  // Try to get from cache first
  const cachedSettings = await getCachedUserSettings(userId)
  if (cachedSettings) return cachedSettings

  // If not in cache, get from database
  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

  if (error) {
    // If settings don't exist, create default settings
    if (error.code === "PGRST116") {
      const defaultSettings: Partial<UserSettings> = {
        user_id: userId,
        preferred_model: "grok-2",
        theme: "system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: newSettings } = await supabase.from("user_settings").insert(defaultSettings).select().single()

      await cacheUserSettings(userId, newSettings)
      return newSettings
    }
    throw error
  }

  // Cache the settings for future requests
  await cacheUserSettings(userId, data)

  return data
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error

  // Update cache
  await cacheUserSettings(userId, data)

  return data
}

export async function generateApiKey(userId: string): Promise<string> {
  const apiKey = `lobe_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`

  await updateUserSettings(userId, { api_key: apiKey })

  return apiKey
}
