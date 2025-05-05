"use server"

import { v4 as uuidv4 } from "uuid"
import {
  saveChat,
  saveMessages,
  getChats,
  getMessages,
  deleteChat,
  updateChatTitle,
  saveAttachment,
  getAttachments,
  saveUserPreference,
  getUserPreference,
} from "@/lib/redis"
import { revalidatePath } from "next/cache"

// For demo purposes, we'll use a fixed user ID
// In a real app, you would get this from authentication
const DEMO_USER_ID = "demo-user"

export async function createNewChat(title = "New Chat", modelId = "grok-2") {
  const chatId = uuidv4()
  await saveChat(DEMO_USER_ID, chatId, title, modelId)
  revalidatePath("/")
  return chatId
}

export async function getUserChats() {
  return getChats(DEMO_USER_ID)
}

export async function getChatMessages(chatId: string) {
  return getMessages(chatId)
}

export async function updateChatMessages(chatId: string, messages: any[]) {
  return saveMessages(chatId, messages)
}

export async function removeChatById(chatId: string) {
  await deleteChat(DEMO_USER_ID, chatId)
  revalidatePath("/")
  return true
}

export async function updateChatTitleById(chatId: string, title: string) {
  await updateChatTitle(DEMO_USER_ID, chatId, title)
  revalidatePath("/")
  return chatId
}

export async function saveChatAttachment(chatId: string, messageId: string, attachment: any) {
  return saveAttachment(chatId, messageId, attachment)
}

export async function getChatAttachments(chatId: string) {
  return getAttachments(chatId)
}

export async function setUserModelPreference(modelId: string) {
  return saveUserPreference(DEMO_USER_ID, "preferredModel", modelId)
}

export async function getUserModelPreference() {
  return getUserPreference(DEMO_USER_ID, "preferredModel", "grok-2")
}

export async function getApiKey() {
  // Generate a simple API key for demo purposes
  // In a real app, you would use a more secure method
  const existingKey = await getUserPreference(DEMO_USER_ID, "apiKey", null)

  if (existingKey) {
    return existingKey
  }

  const newKey = `lobe_${uuidv4().replace(/-/g, "")}`
  await saveUserPreference(DEMO_USER_ID, "apiKey", newKey)
  return newKey
}
