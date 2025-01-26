"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LLMChat({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, input])
      setInput("")
      // Here you would typically send the message to your LLM and handle the response
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">LLM Chat: Project {params.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-800">Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-800">Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] mb-4">
              {messages.map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-100 rounded-md">
                  {msg}
                </div>
              ))}
            </ScrollArea>
            <div className="flex space-x-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." />
              <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700 text-white">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

