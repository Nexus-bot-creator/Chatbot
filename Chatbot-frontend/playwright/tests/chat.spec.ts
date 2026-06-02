import { test, expect } from '@playwright/test'

const API_PATH = '**/message'

test('successful chat flow renders bot response and metadata', async ({ page }) => {
  await page.route(API_PATH, async (route) => {
    const req = route.request()
    const body = await req.postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session_id: body.session_id,
        intent: 'help',
        intent_confidence: 0.92,
        sentiment: { tone: 'neutral' },
        response: 'Sure — here are steps:\n\n- Step 1\n- Step 2',
      }),
    })
  })

  await page.goto('/')
  const textarea = page.getByLabel('Message input')
  await textarea.fill('How do I reset my password?')
  await textarea.press('Enter')
  await expect(page.getByText('Sure — here are steps:')).toBeVisible()
  await expect(page.getByText('Details')).toBeVisible()
})

test('server 500 shows retry', async ({ page }) => {
  await page.route(API_PATH, async (route) => {
    await route.fulfill({ status: 500, body: 'Server error' })
  })
  await page.goto('/')
  const ta = page.getByLabel('Message input')
  await ta.fill('This will error')
  await ta.press('Enter')
  await expect(page.getByText(/Error:/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

test('offline banner and disabled send', async ({ page, context }) => {
  await page.goto('/')
  await context.setOffline(true)
  // dispatch offline event so the app's listener updates UI without reloading
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))
  await expect(page.getByText(/Offline — check your connection/)).toBeVisible()
  const btn = page.getByRole('button', { name: 'Send' })
  await expect(btn).toBeDisabled()
  await context.setOffline(false)
})

test('handles 429 Too Many Requests and shows retry', async ({ page }) => {
  await page.route(API_PATH, async (route) => {
    await route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ detail: 'Too Many Requests' }) })
  })
  await page.goto('/')
  const ta = page.getByLabel('Message input')
  await ta.fill('Trigger 429')
  await ta.press('Enter')
  await expect(page.getByText(/Too Many Requests/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

test('RAG retrieved docs render and export downloads file', async ({ page }) => {
  // preset session id for predictable filename
  await page.addInitScript(() => localStorage.setItem('chat_session_id', 'test-session-1234'))
  await page.route(API_PATH, async (route) => {
    const req = route.request()
    const body = await req.postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session_id: body.session_id,
        intent: 'report_issue',
        intent_confidence: 0.85,
        sentiment: { tone: 'frustrated' },
        response: 'Found this in docs:\n\n- (doc1) See below',
        retrieved_docs: [
          { title: 'Password Reset Guide', source: 'https://example.com/reset', snippet: 'Step 1: click reset' },
        ],
      }),
    })
  })

  await page.goto('/')
  const ta = page.getByLabel('Message input')
  await ta.fill('Show docs')
  await ta.press('Enter')
  await expect(page.getByText('Found this in docs:')).toBeVisible()
  // open details and check retrieved doc title
  // open Details to reveal retrieved docs
  await page.getByText('Details').click()
  await expect(page.getByText('Retrieved documents')).toBeVisible()
  await expect(page.getByText('Password Reset Guide')).toBeVisible()

  // test export download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ])
  expect(await download.suggestedFilename()).toBe('chat-test-session-1234.json')
})
