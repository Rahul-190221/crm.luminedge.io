import { API_URL, readResponseBody } from './base'

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}/student${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })
  const data = await readResponseBody(res)
  if (!res.ok) throw new Error(data?.message || 'Request failed')
  return data
}

export const studentRegister = (body: { name: string; email: string; password: string; phone?: string }) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(body) })

export const studentLogin = (body: { email: string; password: string }) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(body) })

export const studentGoogleAuth = (token: string) =>
  request('/auth/google', { method: 'POST', body: JSON.stringify({ token }) })

export const studentForgotPassword = (email: string) =>
  request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })

export const studentResetPassword = (token: string, password: string) =>
  request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })

export const getStudentProfile = (token: string) =>
  request('/profile', { method: 'GET' }, token)

export const updateStudentProfile = (token: string, body: { name?: string; phone?: string; address?: string }) =>
  request('/profile', { method: 'PUT', body: JSON.stringify(body) }, token)

export const changeStudentPassword = (token: string, body: { currentPassword: string; newPassword: string }) =>
  request('/profile/password', { method: 'PUT', body: JSON.stringify(body) }, token)

export const submitStudentOnboarding = (token: string, body: Record<string, any>) =>
  request('/onboarding', { method: 'PUT', body: JSON.stringify(body) }, token)
