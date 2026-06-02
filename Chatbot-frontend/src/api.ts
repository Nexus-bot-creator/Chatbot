import type { ApiRequest, ApiResponse } from './types'
import { API_BASE } from './utils'

const TIMEOUT = 20000

function timeoutFetch(input: RequestInfo, init: RequestInit = {}, timeout = TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id))
}

async function postMessage(req: ApiRequest, retries = 2): Promise<ApiResponse> {
  try {
    const res = await timeoutFetch(`${API_BASE}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res) throw new Error('No response')
    // handle specific non-ok statuses
    if (!res.ok) {
      if (res.status === 400) {
        const json = await res.json().catch(() => ({}))
        throw Object.assign(new Error('Bad Request: ' + (json.detail || JSON.stringify(json))), { status: 400, body: json })
      }
      if (res.status === 429) {
        const json = await res.json().catch(() => ({}))
        throw Object.assign(new Error('Too Many Requests: ' + (json.detail || 'retry later')), { status: 429, body: json })
      }
      if (res.status === 502 || res.status === 503) {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 500 * Math.pow(2, 2 - retries)))
          return postMessage(req, retries - 1)
        }
        throw Object.assign(new Error('Bad Gateway'), { status: res.status })
      }
      if (res.status >= 500) {
        const text = await res.text().catch(() => '')
        throw Object.assign(new Error('Server Error: ' + text), { status: res.status, body: text })
      }
    }
    const data = await res.json()
    return data as ApiResponse
  } catch (err: any) {
    if (err.name === 'AbortError') throw Object.assign(new Error('Timeout'), { code: 'TIMEOUT' })
    throw err
  }
}

export { postMessage }
