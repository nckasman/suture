import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface LLMChatWindowProps {
  isOpen: boolean
  onClose: () => void
}

export function LLMChatWindow({ isOpen, onClose }: LLMChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }])
      setInput("")
      // Here you would typically send the message to your LLM and handle the response
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "This is a simulated response from the AI assistant." },
        ])
      }, 1000)
    }
  }

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-4 right-20 w-80 h-96 shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          AI Assistant
          <Button variant="ghost" size="sm" onClick={onClose}>
            X
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <ScrollArea className="flex-grow mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${msg.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"}`}
            >
              {msg.content}
            </div>
          ))}
        </ScrollArea>
        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-grow mr-2"
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </CardContent>
    </Card>
  )
}

