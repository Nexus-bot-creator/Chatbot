import { render, screen, fireEvent } from '@testing-library/react'
import InputBar from '../components/InputBar'
import React from 'react'
import { act } from 'react-dom/test-utils'

test('InputBar sends message and clears textarea', async () => {
  const send = vi.fn(async (t: string) => {})
  render(<InputBar onSend={send} />)
  const textarea = screen.getByLabelText('Message input') as HTMLTextAreaElement
  await act(async () => {
    fireEvent.change(textarea, { target: { value: 'hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })
  })
  expect(send).toHaveBeenCalledWith('hello')
})
