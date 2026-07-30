const LOCAL_API_URL = 'https://crm-eta-blush.vercel.app/api'
const LOCAL_API_ORIGIN = 'https://crm-eta-blush.vercel.app'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

const normalizeUrl = (value: string): string => value.trim().replace(/\/+$/, '')

const isLocalHost = (): boolean => {
  if (typeof window !== 'undefined') {
    return LOCAL_HOSTS.has(window.location.hostname.toLowerCase())
  }
  return false
}

const getServerSideOrigin = (): string | null => {
  // Netlify provides a full URL; Vercel provides only the bare host in VERCEL_URL.
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL
  if (siteUrl) {
    try { return new URL(siteUrl).origin } catch { return null }
  }
  if (process.env.VERCEL_URL) {
    try { return new URL(`https://${process.env.VERCEL_URL}`).origin } catch { return null }
  }
  return null
}

const safeOrigin = (url: string): string | null => {
  try { return new URL(url).origin } catch { return null }
}

// NEXT_PUBLIC_API_URL must be set in production to the Express backend URL.
// e.g. https://crm-eta-blush.vercel.app/api
// Without it in production, API calls will fail — there is no safe guess for a cross-domain backend.
const resolveApiUrl = (): string => {
  let configuredUrl = process.env.NEXT_PUBLIC_API_URL

  // Guard against .env.local being accidentally deployed to production
  if (configuredUrl && configuredUrl.includes('localhost') && !isLocalHost()) {
    configuredUrl = ''
  }

  if (configuredUrl) {
    return configuredUrl
  }

  // Local development — use the dev server directly
  if (isLocalHost() || process.env.NODE_ENV === 'development') {
    return LOCAL_API_URL
  }
  // SSR/build — try Netlify / Vercel env vars for the deploy URL
  const serverOrigin = getServerSideOrigin()
  if (serverOrigin) return `${serverOrigin}/api`

  // Last resort: relative path. Will only work if the backend is co-deployed with the frontend or proxied.
  return '/api'
}

export const API_URL = normalizeUrl(resolveApiUrl())
export const API_ORIGIN = normalizeUrl(
  (process.env.NEXT_PUBLIC_API_URL ? safeOrigin(process.env.NEXT_PUBLIC_API_URL) : null)
    ?? (isLocalHost() ? LOCAL_API_ORIGIN : null)
    ?? getServerSideOrigin()
    ?? ''
)

const originalFetch = globalThis.fetch.bind(globalThis)
const normalizeApiRequest = (input: RequestInfo | URL) => {
  const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  return rawUrl.includes('/api/')
}

if (!(globalThis as typeof globalThis & { __luminedgeApiFetchPatched?: boolean }).__luminedgeApiFetchPatched) {
  ;(globalThis as typeof globalThis & { __luminedgeApiFetchPatched?: boolean }).__luminedgeApiFetchPatched = true
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init)

    if (!normalizeApiRequest(input)) return response

    const text = await response.clone().text()
    if (!text) return response

    try {
      JSON.parse(text)
      return response
    } catch {
      const headers = new Headers(response.headers)
      headers.set('content-type', 'application/json; charset=utf-8')
      return new Response(JSON.stringify({ message: text }), {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
  }
}

export async function readResponseBody(response: Response): Promise<any> {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return { message: text } }
}
