import { NextRequest, NextResponse } from 'next/server'

// The middleware is a routing/UX layer — it decides which page to show, not
// whether to grant data access. Every backend API route independently verifies
// the JWT signature, so forging a cookie only gives access to the page shell
// (no data). Using pure-JS decode here eliminates Netlify Edge Runtime
// incompatibilities with jose / Web Crypto API that silently reject all tokens.
function verifyToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload || typeof payload !== 'object') return null
    // Require exp and reject expired tokens
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null
    return payload as Record<string, any>
  } catch {
    return null
  }
}

function dashboardForRole(role: string): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'bdm') return '/bdm/dashboard'
  if (role === 'student') return '/student/dashboard'
  return '/login'
}

function isStaffRole(role: string): boolean {
  return role === 'admin' || role === 'bdm'
}

// Auth-gate redirects must never be cached — a cached 307 from a since-expired
// or since-deleted cookie would keep replaying after the underlying state changes.
function redirectNoStore(url: URL): NextResponse {
  const res = NextResponse.redirect(url)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export function middleware(request: NextRequest) {
  // Any unexpected throw here (malformed URL/headers, platform edge case) must
  // not crash the edge function and take the whole site down — fall back to
  // letting the request through un-redirected; page-level/API auth still applies.
  try {
    return routeRequest(request)
  } catch {
    return NextResponse.next()
  }
}

function routeRequest(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Staff use accessToken; students use studentToken
  const staffToken = request.cookies.get('accessToken')?.value
  const studentToken = request.cookies.get('studentToken')?.value

  const staffPayloadRaw = staffToken ? verifyToken(staffToken) : null
  const studentPayload = studentToken ? verifyToken(studentToken) : null

  // The accessToken cookie must carry an actual staff role. A token signed
  // for a student (e.g. a stale cookie from before student tokens moved to
  // their own studentToken cookie) must never be trusted as staff — otherwise
  // dashboardForRole() sends it to /student/dashboard, which rejects it for
  // lacking a real studentToken, bouncing back to /login forever since this
  // cookie is never the one that gets cleared on that path.
  const staffRoleRaw: string = staffPayloadRaw ? (staffPayloadRaw.role ?? '') : ''
  const staffPayload = staffPayloadRaw && isStaffRole(staffRoleRaw) ? staffPayloadRaw : null
  const staffRole: string = staffPayload ? staffRoleRaw : ''
  const studentRole: string = studentPayload ? (studentPayload.role ?? '') : ''

  // ── Redirect already-authenticated users away from auth pages ──────────────
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    if (staffPayload && staffRole) {
      const dest = dashboardForRole(staffRole)
      if (dest !== '/login') return redirectNoStore(new URL(dest, request.url))
    }
    if (studentPayload && studentRole === 'student') {
      return redirectNoStore(new URL('/student/dashboard', request.url))
    }
  }

  if (pathname === '/student' || pathname === '/student/login' || pathname === '/student/register') {
    if (studentPayload && studentRole === 'student') {
      return redirectNoStore(new URL('/student/dashboard', request.url))
    }
  }

  // ── Protect /admin/* — admin only ──────────────────────────────────────────
  if (pathname.startsWith('/admin/')) {
    if (!staffPayload) {
      const res = redirectNoStore(new URL('/login', request.url))
      if (staffToken) res.cookies.delete('accessToken')
      return res
    }
    if (staffRole !== 'admin') {
      return redirectNoStore(new URL(dashboardForRole(staffRole || studentRole), request.url))
    }
  }

  // ── Protect /bdm/dashboard — bdm only ─────────────────────────────────────
  if (pathname.startsWith('/bdm/dashboard')) {
    if (!staffPayload) {
      const res = redirectNoStore(new URL('/login', request.url))
      if (staffToken) res.cookies.delete('accessToken')
      return res
    }
    if (staffRole !== 'bdm') {
      return redirectNoStore(new URL(dashboardForRole(staffRole || studentRole), request.url))
    }
  }

  // ── Protect /student/dashboard — student only ──────────────────────────────
  if (pathname.startsWith('/student/dashboard')) {
    if (!studentPayload) {
      const res = redirectNoStore(new URL('/login', request.url))
      if (studentToken) res.cookies.delete('studentToken')
      return res
    }
    if (studentRole !== 'student') {
      return redirectNoStore(new URL(dashboardForRole(staffRole || studentRole), request.url))
    }
  }

  // ── Protect /dashboard — staff only (legacy SPA fallback) ─────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!staffPayload) {
      const res = redirectNoStore(new URL('/login', request.url))
      if (staffToken) res.cookies.delete('accessToken')
      return res
    }
    if (staffRole !== 'admin' && staffRole !== 'bdm') {
      return redirectNoStore(new URL(dashboardForRole(staffRole || studentRole), request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/student',
    '/student/login',
    '/student/register',
    '/admin/dashboard/:path*',
    '/admin/users/:path*',
    '/bdm/dashboard/:path*',
    '/student/dashboard/:path*',
    '/dashboard/:path*',
  ],
}
