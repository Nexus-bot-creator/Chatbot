import React, { useState, useEffect } from 'react'
import type { Message } from '../types'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

type Props = {
  message: Message
  onRetry?: () => void
}

export default function MessageBubble({ message, onRetry }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`bubble ${isUser ? 'user' : 'bot'}`} aria-live={isUser ? undefined : 'polite'}>
      <div className="bubble-content">
        {!isUser && message.meta ? (
          <details className="meta">
            <summary>Details</summary>
            <div>Intent: {message.meta.intent ?? '—'}</div>
            <div>Confidence: {message.meta.intent_confidence ?? '—'}</div>
            <div>Sentiment: {JSON.stringify(message.meta.sentiment ?? {})}</div>
            {message.meta.retrieved_docs ? (
              <div className="retrieved-docs">
                <strong>Retrieved documents</strong>
                <ul>
                  {message.meta.retrieved_docs.map((d: any, i: number) => (
                    <li key={i}>
                      <details>
                        <summary>{d.title ?? `Document ${i + 1}`}</summary>
                        <div className="snippet">{d.snippet}</div>
                        <div className="source">Source: {d.source ?? 'unknown'}</div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </details>
        ) : null}
        <div className="bubble-text">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{message.text}</ReactMarkdown>
        </div>
        <div className="bubble-foot">
          <small>{new Date(message.created_at).toLocaleTimeString()}</small>
          {message.status === 'pending' && <span className="loader">⏳</span>}
          {message.status === 'error' && (
            <button className="retry" onClick={onRetry} aria-label="Retry">Retry</button>
          )}
        </div>
      </div>
    </div>
  )
}
