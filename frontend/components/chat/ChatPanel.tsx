'use client'

import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { X, Sparkles, Send, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useChat, ChatMessage, ChatbotSource } from '@/lib/context/ChatContext'
import { getSupportRagStatus, reindexSupportManual, SupportRagStatus } from '@/lib/api/chatbot'
import { useUser } from '@/lib/context/UserContext'

const CONFIDENCE_STYLES = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-red-100 text-red-700',
}

function SourcesSection({ sources }: { sources: ChatbotSource[] }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="mt-2 border-t border-slate-200 pt-2">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {sources.length} source{sources.length !== 1 ? 's' : ''}
      </button>
      {expanded && (
        <div className="mt-2 flex flex-col gap-2">
          {sources.map((s) => (
            <div key={s.sourceNumber} className="bg-slate-50 rounded-lg px-2.5 py-2 text-xs">
              <p className="font-medium text-slate-700">{s.sectionTitle}</p>
              <p className="text-slate-400 mt-0.5">
                {s.sourceName}{s.pageNumber != null ? ` · p.${s.pageNumber}` : ''}
              </p>
              <p className="text-slate-500 mt-1 leading-relaxed italic">"{s.excerpt}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AssistantBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-start">
      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
        <Sparkles size={11} className="text-indigo-500" />
      </div>
      <div className="max-w-[85%] bg-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-slate-800 leading-relaxed">
        {/* Confidence badge */}
        {msg.confidence && (
          <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-full mb-2 ${CONFIDENCE_STYLES[msg.confidence]}`}>
            {msg.confidence} confidence
          </span>
        )}

        {/* Answer */}
        <p>{msg.content}</p>

        {/* Next steps */}
        {msg.nextSteps && msg.nextSteps.length > 0 && (
          <div className="mt-2.5 border-t border-slate-200 pt-2">
            <p className="text-xs font-medium text-slate-500 mb-1">Next steps</p>
            <ul className="flex flex-col gap-1">
              {msg.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="text-indigo-400 font-bold mt-px">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {msg.sources && msg.sources.length > 0 && (
          <SourcesSection sources={msg.sources} />
        )}
      </div>
    </div>
  )
}

export default function ChatPanel() {
  const { isOpen, close, messages, loading, sendMessage, clearMessages } = useChat()
  const user = useUser()
  const isAdmin = user?.role === 'admin'
  const [input, setInput] = useState('')
  const [ragStatus, setRagStatus] = useState<SupportRagStatus | null>(null)
  const [reindexing, setReindexing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300)
      // Fetch RAG status — silently ignore if user lacks permission
      getSupportRagStatus().then(setRagStatus).catch(() => {})
    }
  }, [isOpen])

  async function handleReindex() {
    setReindexing(true)
    try {
      const result = await reindexSupportManual()
      toast.success(`Manual reindexed — ${result.chunkCount} chunks across ${result.pageCount} pages.`)
      getSupportRagStatus().then(setRagStatus).catch(() => {})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reindex failed.')
    } finally {
      setReindexing(false)
    }
  }

  function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={close} />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-[#0f1535] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Sparkles size={15} className="text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-white text-sm font-semibold leading-tight">TriMerge Assist</p>
                {ragStatus && (
                  <span
                    title={ragStatus.indexed ? `Indexed · ${ragStatus.chunkCount} chunks` : 'Manual not indexed yet'}
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${ragStatus.indexed ? 'bg-green-400' : 'bg-yellow-400'}`}
                  />
                )}
              </div>
              <p className="text-indigo-300 text-xs">AI-powered compliance assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && ragStatus && (
              <button
                onClick={handleReindex}
                disabled={reindexing}
                title="Reindex support manual"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={reindexing ? 'animate-spin' : ''} />
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={close}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Sparkles size={22} className="text-indigo-500" />
              </div>
              <p className="text-slate-700 font-medium text-sm">How can I help you?</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Ask me about findings, compliance policies, handbook sections, or anything related to your audit.
              </p>
              {ragStatus && !ragStatus.indexed && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
                  The support manual hasn't been indexed yet. Answers may be limited.
                </div>
              )}
            </div>
          ) : (
            messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-indigo-600 text-white text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <AssistantBubble key={msg.id} msg={msg} />
              )
            )
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Sparkles size={11} className="text-indigo-500" />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask TriMerge Assist…"
              disabled={loading}
              className="flex-1 bg-transparent resize-none text-sm text-slate-800 placeholder:text-slate-400 outline-none max-h-32 disabled:opacity-50"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  )
}
