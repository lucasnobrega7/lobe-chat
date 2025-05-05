"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Settings, PanelLeft, Send, Trash2, Edit, Code, Download, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { v4 as uuidv4 } from "uuid"
import { FileUpload } from "./file-upload"
import { FilePreview } from "./file-preview"
import { ModelSelector } from "./model-selector"
import { ApiSettings } from "./api-settings"
import { ChatMessage } from "./chat-message"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import {
  createChat,
  getUserChats,
  getChatMessages,
  updateChatTitle,
  deleteChat,
  getChatAttachments,
  getUserSettings,
  updateUserSettings,
} from "@/lib/db"
import type { Chat, Attachment } from "@/lib/types"

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("chat")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
  const [selectedModelId, setSelectedModelId] = useState("grok-2")
  const { theme, setTheme } = useTheme()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuth()

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: "/api/chat",
    body: {
      chatId: currentChatId,
      modelId: selectedModelId,
      userId: user?.id,
    },
    onFinish: async (message) => {
      // Messages are saved in the API route
      loadMessages()
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Load user data on initial render
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Load user settings
        const settings = await getUserSettings(user.id)
        setSelectedModelId(settings.preferred_model)

        // Load chats
        const userChats = await getUserChats(user.id)
        setChats(userChats)

        // If there are chats, select the first one
        if (userChats.length > 0) {
          setCurrentChatId(userChats[0].id)
          await loadChatData(userChats[0].id)
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const loadChatData = async (chatId: string) => {
    try {
      // Load messages
      const chatMessages = await getChatMessages(chatId)
      setMessages(chatMessages)

      // Load attachments
      const chatAttachments = await getChatAttachments(chatId)
      setAttachments(chatAttachments)
    } catch (error) {
      console.error("Failed to load chat data:", error)
    }
  }

  const loadMessages = async () => {
    if (!currentChatId) return

    try {
      const chatMessages = await getChatMessages(currentChatId)
      setMessages(chatMessages)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleNewChat = async () => {
    if (!user) return

    try {
      const newChat = await createChat(user.id, "New Chat", selectedModelId)
      setChats([newChat, ...chats])
      setCurrentChatId(newChat.id)
      setMessages([])
      setPendingAttachments([])
      setAttachments([])
      setActiveTab("chat")
    } catch (error) {
      console.error("Failed to create new chat:", error)
    }
  }

  const handleSelectChat = async (chatId: string) => {
    try {
      setCurrentChatId(chatId)
      await loadChatData(chatId)
      setPendingAttachments([])
      setActiveTab("chat")
    } catch (error) {
      console.error("Failed to load chat data:", error)
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteChat(chatId)

      // Update local state
      const updatedChats = chats.filter((chat) => chat.id !== chatId)
      setChats(updatedChats)

      if (currentChatId === chatId) {
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id)
          await loadChatData(updatedChats[0].id)
        } else {
          setCurrentChatId(null)
          setMessages([])
          setAttachments([])
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  const handleEditTitle = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingTitle(chatId)
    setNewTitle(currentTitle)
  }

  const handleSaveTitle = async (chatId: string) => {
    try {
      await updateChatTitle(chatId, newTitle)

      // Update local state
      setChats(chats.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat)))

      setIsEditingTitle(null)
    } catch (error) {
      console.error("Failed to update chat title:", error)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // If no chat is selected, create a new one
    if (!currentChatId) {
      const newChat = await createChat(user.id, "New Chat", selectedModelId)
      setCurrentChatId(newChat.id)
      setChats([newChat, ...chats])
    }

    // Add any pending attachments to the message
    const messageWithAttachments =
      input.trim() +
      (pendingAttachments.length > 0 ? "\n\n" + pendingAttachments.map((a) => `[${a.name}](${a.url})`).join("\n") : "")

    // Clear pending attachments
    setPendingAttachments([])

    // Create a custom message with the input and attachments
    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content: messageWithAttachments,
    }

    // Add the message to the UI
    setMessages([...messages, userMessage])

    // Clear the input
    handleInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLTextAreaElement>)

    // Submit the message to the API
    await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        chatId: currentChatId,
        modelId: selectedModelId,
        userId: user.id,
      }),
    })
  }

  const handleFileUpload = (file: Attachment) => {
    setPendingAttachments([...pendingAttachments, file])
  }

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments(pendingAttachments.filter((_, i) => i !== index))
  }

  const handleModelChange = async (modelId: string) => {
    setSelectedModelId(modelId)

    if (user) {
      try {
        await updateUserSettings(user.id, { preferred_model: modelId })
      } catch (error) {
        console.error("Failed to update user settings:", error)
      }
    }
  }

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId)
  }

  const exportChatHistory = () => {
    if (!currentChatId) return

    const chat = getCurrentChat()
    const fileName = `${chat?.title || "chat"}-export-${new Date().toISOString().slice(0, 10)}.json`

    const exportData = {
      id: currentChatId,
      title: chat?.title,
      messages,
      attachments,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-card border-r border-border p-4 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Lobe Chat</h1>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <PanelLeft className="h-5 w-5" />
            </Button>
          </div>

          <Button className="mb-4 justify-start" variant="outline" onClick={handleNewChat}>
            <MessageCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading chats...</p>
              ) : chats.length === 0 ? (
                <p className="text-center text-muted-foreground">No chats yet</p>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-2 rounded hover:bg-accent cursor-pointer ${currentChatId === chat.id ? "bg-accent" : ""}`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    {isEditingTitle === chat.id ? (
                      <div className="flex items-center">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="flex-1 mr-2"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveTitle(chat.id)
                            }
                          }}
                        />
                        <Button size="sm" onClick={() => handleSaveTitle(chat.id)}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{chat.title}</p>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-50 hover:opacity-100"
                              onClick={(e) => handleEditTitle(chat.id, chat.title, e)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-50 hover:opacity-100 hover:text-destructive"
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-auto">
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">
            {currentChatId ? getCurrentChat()?.title || "Current Chat" : "New Chat"}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            {currentChatId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportChatHistory}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("api")}>
                    <Code className="mr-2 h-4 w-4" />
                    API Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <TabsList>
              <TabsTrigger value="chat" onClick={() => setActiveTab("chat")}>
                Chat
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => setActiveTab("settings")}>
                Settings
              </TabsTrigger>
              <TabsTrigger value="api" onClick={() => setActiveTab("api")}>
                API
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              {/* Chat Area */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Welcome to Lobe Chat</h3>
                      <p className="text-muted-foreground mb-4">Start a conversation with the AI assistant</p>
                      <div className="max-w-md mx-auto">
                        <ModelSelector selectedModelId={selectedModelId} onModelChange={handleModelChange} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <ChatMessage
                        key={index}
                        message={message}
                        attachments={attachments.filter((a) => a.message_id === message.id)}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-card">
                {pendingAttachments.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {pendingAttachments.map((attachment, index) => (
                      <FilePreview
                        key={attachment.id}
                        file={attachment}
                        onRemove={() => handleRemoveAttachment(index)}
                      />
                    ))}
                  </div>
                )}

                <form onSubmit={handleChatSubmit} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      className="min-h-[80px] resize-none pr-10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleChatSubmit(e)
                        }
                      }}
                    />
                    <div className="absolute bottom-2 right-2">
                      <FileUpload
                        chatId={currentChatId || "temp"}
                        userId={user?.id || ""}
                        onUploadComplete={handleFileUpload}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={!input.trim() && pendingAttachments.length === 0}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-4">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Settings</h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-medium mb-2">Model Settings</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose which AI model to use for your conversations
                      </p>
                      <ModelSelector selectedModelId={selectedModelId} onModelChange={handleModelChange} />
                    </div>

                    <div>
                      <h4 className="text-base font-medium mb-2">Theme</h4>
                      <p className="text-sm text-muted-foreground mb-4">Choose your preferred theme</p>
                      <div className="flex space-x-2">
                        <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
                          Light
                        </Button>
                        <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
                          Dark
                        </Button>
                        <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>
                          System
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "api" && (
            <div className="p-4">
              <ApiSettings userId={user?.id || ""} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
