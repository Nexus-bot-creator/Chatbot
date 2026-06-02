import React, { useRef, useEffect } from 'react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'

type Props = {
  messages: Message[]
  onRetry: (msg: Message) => void
}

export default function MessageList({ messages, onRetry }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="message-list" ref={ref}>
      {messages.map((m) => (
        <div key={m.id} className="message-item">
          <MessageBubble message={m} onRetry={() => onRetry(m)} />
        </div>
      ))}
    </div>
  )
}
