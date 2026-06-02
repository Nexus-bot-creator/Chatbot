import React, { useState, useEffect, useRef } from 'react'

type Props = {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
}

export default function InputBar({ onSend, disabled = false }: Props) {
  const [text, setText] = useState('')
  const [chars, setChars] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const limit = 2000

  useEffect(() => setChars(text.length), [text])

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    await onSend(trimmed)
    setText('')
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="input-bar">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        maxLength={limit}
        aria-label="Message input"
      />
      <div className="input-controls">
        <div className="counter">{chars}/{limit}</div>
        <button onClick={() => submit()} disabled={disabled || text.trim().length === 0} aria-label="Send">
          Send
        </button>
      </div>
    </div>
  )
}
