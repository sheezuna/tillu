'use client'

import React, { useState } from 'react'
import { Button, Card, CardContent, Input } from '@tillu/ui'
import { MessageCircle, Send } from 'lucide-react'

interface AIAssistantProps {
  branchId: string
}

export function AIAssistant({ branchId }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const askAssistant = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context: { branchId } }),
      })

      const data = await res.json()
      setResponse(data.response)
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">AI Assistant</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </div>

        {response && (
          <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
            {response}
          </div>
        )}

        <div className="flex space-x-2">
          <Input
            placeholder="Ask about sales, inventory, customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askAssistant()}
            disabled={isLoading}
          />
          <Button onClick={askAssistant} disabled={isLoading || !query.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Try: "What are today's sales?", "Check chicken stock", "Best selling item"
        </div>
      </CardContent>
    </Card>
  )
}
