"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check } from "lucide-react"
import { getApiKey } from "@/app/actions"
import { models } from "@/lib/models"

export function ApiSettings() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getApiKey()
        setApiKey(key)
      } catch (error) {
        console.error("Error fetching API key:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApiKey()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/api/v1` : ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Access</CardTitle>
        <CardDescription>Access your chat models programmatically using our REST API</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="authentication">
          <TabsList className="mb-4">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Your API Key</h3>
                <div className="flex gap-2">
                  <Input value={loading ? "Loading..." : apiKey || ""} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => apiKey && copyToClipboard(apiKey)}
                    disabled={loading || !apiKey}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Keep this key secret. Include it in the x-api-key header in your requests.
                </p>
              </div>

              <div className="bg-gray-100 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Example Request</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-800 text-gray-100 rounded">
                  {`curl -X POST ${baseUrl}/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{"messages":[{"role":"user","content":"Hello!"}],"modelId":"grok-2"}'`}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endpoints">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Chat Completion</h3>
                <p className="text-sm text-gray-500 mb-1">POST {baseUrl}/chat</p>
                <p className="text-xs text-gray-500">
                  Generate a response from the AI model based on the conversation history.
                </p>
              </div>

              <div className="bg-gray-100 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Request Body</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-800 text-gray-100 rounded">
                  {`{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "modelId": "grok-2",  // Optional, defaults to grok-2
  "stream": true        // Optional query param, defaults to false
}`}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">The following models are available through the API:</p>

              <div className="space-y-2">
                {models.map((model) => (
                  <div key={model.id} className="p-3 border rounded-md">
                    <h3 className="text-sm font-medium">{model.name}</h3>
                    <p className="text-xs text-gray-500">{model.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Provider: {model.provider} | Context: {model.contextLength} tokens
                    </p>
                    <p className="text-xs font-mono mt-1">ID: {model.id}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
