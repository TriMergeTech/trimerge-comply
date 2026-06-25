import { getAccessToken } from '@/lib/authTokens'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

async function chatbotFetch<T>(path: string): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Request failed')
  return data as T
}

export interface SupportRagStatus {
  chatbotKey: string
  sourceName: string
  indexed: boolean
  chunkCount: number
  sourceHash: string | null
  embeddingModel: string | null
  lastIndexedAt: string | null
}

export async function getSupportRagStatus(): Promise<SupportRagStatus> {
  const res = await chatbotFetch<{ data: SupportRagStatus }>('/chatbots/support/rag/status')
  return res.data
}

export interface ReindexResult {
  chatbotKey: string
  sourceName: string
  sourceHash: string
  pageCount: number
  chunkCount: number
  embeddingModel: string
}

export async function reindexSupportManual(): Promise<ReindexResult> {
  const token = getAccessToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}/chatbots/support/rag/reindex`, { method: 'POST', headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Reindex failed')
  return data.data
}
