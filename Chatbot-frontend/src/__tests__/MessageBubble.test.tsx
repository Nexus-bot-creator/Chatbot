import { render, screen } from '@testing-library/react'
import MessageBubble from '../components/MessageBubble'
import React from 'react'

const msg = {
  id: '1',
  session_id: 's',
  role: 'bot',
  text: 'Hello **world**\n\n- item1',
  status: 'received',
  created_at: new Date().toISOString(),
  meta: { intent: 'greeting', intent_confidence: 0.9, sentiment: { tone: 'neutral' } },
}

test('renders markdown and meta', () => {
  render(<MessageBubble message={msg as any} />)
  expect(screen.getByText('Hello')).toBeTruthy()
  expect(screen.getByText('item1')).toBeTruthy()
  expect(screen.getByText('Details')).toBeTruthy()
})
