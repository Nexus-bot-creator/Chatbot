import React from 'react'

type Props = {
  onNew: () => void
  onClearLocal: () => void
  onExport: () => void
  sessionId: string
}

export default function Header({ onNew, onClearLocal, onExport, sessionId }: Props) {
  return (
    <header className="header">
      <div className="header-left">Chatbot UI</div>
      <div className="header-right">
        <button onClick={onNew}>New Chat</button>
        <button onClick={onClearLocal}>Clear Local</button>
        <button onClick={onExport}>Export</button>
        <div className="session-id" title={sessionId}>Session: {sessionId.slice(0, 8)}</div>
      </div>
    </header>
  )
}
