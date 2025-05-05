import { Redis } from "@upstash/redis"

// Create Redis client using environment variables
export const redis = Redis.fromEnv()

// Cache chat messages for faster retrieval
export async function cacheMessages(chatId: string, messages: any[]) {
  const key = `chat:${chatId}:messages`
  await redis.set(key, JSON.stringify(messages), { ex: 60 * 60 * 24 * 7 }) // Cache for 7 days
  return messages
}

export async function getCachedMessages(chatId: string) {
  const key = `chat:${chatId}:messages`
  const messages = await redis.get(key)
  return messages ? JSON.parse(messages as string) : null
}

// Cache user settings
export async function cacheUserSettings(userId: string, settings: any) {
  const key = `user:${userId}:settings`
  await redis.set(key, JSON.stringify(settings), { ex: 60 * 60 * 24 * 7 }) // Cache for 7 days
  return settings
}

export async function getCachedUserSettings(userId: string) {
  const key = `user:${userId}:settings`
  const settings = await redis.get(key)
  return settings ? JSON.parse(settings as string) : null
}

// Rate limiting
export async function checkRateLimit(userId: string, limit = 100) {
  const key = `ratelimit:${userId}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 60 * 60 * 24) // Reset after 24 hours
  }

  return count <= limit
}
