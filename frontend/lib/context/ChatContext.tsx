'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { getAccessToken } from '@/lib/authTokens'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export interface ChatbotSource {
  sourceNumber: number
  sourceName: string
  pageNumber: number | null
  sectionTitle: string
  excerpt: string
  relevanceScore: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  confidence?: 'low' | 'medium' | 'high'
  nextSteps?: string[]
  sources?: ChatbotSource[]
}

interface ChatContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
  messages: ChatMessage[]
  loading: boolean
  sendMessage: (question: string) => Promise<void>
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const toggle = useCallback(() => setIsOpen((o) => !o), [])
  const close = useCallback(() => setIsOpen(false), [])
  const clearMessages = useCallback(() => setMessages([]), [])

  const sendMessage = useCallback(async (question: string) => {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const token = getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${BASE}/chatbots/support/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Request failed')

      const { answer, confidence, nextSteps, sources } = data.data

      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        confidence,
        nextSteps,
        sources,
      }
      setMessages((prev) => [...prev, reply])
    } catch (err) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Something went wrong: ${err instanceof Error ? err.message : 'unknown error'}`,
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <ChatContext.Provider value={{ isOpen, toggle, close, messages, loading, sendMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
