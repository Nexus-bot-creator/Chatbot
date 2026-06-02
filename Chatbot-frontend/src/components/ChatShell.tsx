import React, { useState, useEffect } from 'react'
import Header from './Header'
import MessageList from './MessageList'
import InputBar from './InputBar'
import type { Message } from '../types'
import { uuid } from '../utils'
import { postMessage } from '../api'

const STORAGE_KEY = 'chat_session_id'
const MESSAGES_KEY = 'chat_messages_v1'

export default function ChatShell() {
  const [sessionId, setSessionId] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || uuid())
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(MESSAGES_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [sending, setSending] = useState(false)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, sessionId)
  }, [sessionId])

  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    const onOffline = () => setOffline(true)
    const onOnline = () => setOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  const startNew = () => {
    const id = uuid()
    setSessionId(id)
    setMessages([])
    localStorage.removeItem(MESSAGES_KEY)
  }

  const clearLocal = () => {
    setMessages([])
    localStorage.removeItem(MESSAGES_KEY)
  }

  const exportChat = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${sessionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const send = async (text: string) => {
    if (!text.trim()) return
    if (sending) return
    setSending(true)
    const userMsg: Message = {
      id: uuid(),
      session_id: sessionId,
      role: 'user',
      text,
      status: 'sent',
      created_at: new Date().toISOString(),
    }
    const botPending: Message = {
      id: uuid(),
      session_id: sessionId,
      role: 'bot',
      text: '...',
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    setMessages((s) => [...s, userMsg, botPending])

    try {
      const res = await postMessage({ session_id: sessionId, text })
      setMessages((s) =>
        s.map((m) =>
          m.id === botPending.id
            ? {
                ...m,
                text: res.response,
                status: 'received',
                meta: { intent: res.intent, intent_confidence: res.intent_confidence, sentiment: res.sentiment, retrieved_docs: (res as any).retrieved_docs },
              }
            : m
        )
      )
    } catch (err: any) {
      setMessages((s) => s.map((m) => (m.id === botPending.id ? { ...m, text: 'Error: ' + (err.message || 'Unknown'), status: 'error' } : m)))
    } finally {
      setSending(false)
    }
  }

  const retryMessage = async (msg: Message) => {
    // find previous user message text (we store user before bot)
    const idx = messages.findIndex((m) => m.id === msg.id)
    const prevUser = messages.slice(0, idx).reverse().find((m) => m.role === 'user')
    if (!prevUser) return
    await send(prevUser.text)
  }

  return (
    <div className="shell">
      <Header onNew={startNew} onClearLocal={clearLocal} onExport={exportChat} sessionId={sessionId} />
      {offline && <div className="offline">Offline — check your connection</div>}
      <MessageList messages={messages} onRetry={retryMessage} />
      <InputBar onSend={send} disabled={sending || offline} />
    </div>
  )
}
