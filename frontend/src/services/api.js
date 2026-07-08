/**
 * api.js — Axios instance and all API calls.
 * The base URL points to FastAPI via Vite's dev proxy (/api → localhost:8000).
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// ── Axios instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 35_000,          // slightly longer than server timeout
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor — normalise errors ───────────────────────────────────
apiClient.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      (error.message === 'Network Error' ? 'Cannot reach the server. Is the backend running?' : null) ||
      'Something went wrong. Please try again.'

    return Promise.reject(new Error(message))
  }
)

// ── API methods ───────────────────────────────────────────────────────────────

/**
 * Send a chat message to Gemini.
 * @param {string} message
 * @param {AbortSignal} [signal] - optional AbortController signal for cancellation
 * @returns {Promise<{ response: string, model: string, tokens_used: number|null }>}
 */
export async function sendMessage(message, signal) {
  const res = await apiClient.post('/chat', { message }, { signal })
  return res.data
}

/**
 * Health-check endpoint — used by the Header to show connection status.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    await apiClient.get('/health', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}
