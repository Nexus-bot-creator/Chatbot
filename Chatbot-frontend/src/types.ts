export type Role = 'user' | 'bot'

export type MessageStatus = 'sent' | 'pending' | 'error' | 'received'

export type Message = {
  id: string
  session_id: string
  role: Role
  text: string
  status: MessageStatus
  created_at: string
  meta?: { intent?: string; intent_confidence?: number; sentiment?: any }
}

export type ApiRequest = { session_id: string; text: string }

export type ApiResponse = {
  session_id: string
  intent: string | null
  intent_confidence: number | null
  sentiment: any | null
  response: string
  retrieved_docs?: Array<{ title?: string; source?: string; snippet?: string }>
}
