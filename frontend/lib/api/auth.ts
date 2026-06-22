import { API_URL, readResponseBody } from './base'

export const registerUser = async (formData: any, token?: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(formData),
    cache: 'no-store',
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Registration failed')
  }

  return data
}

export const googleLogin = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Google login failed')
  }

  return data
}

export const googleRegister = async (token: string, role: string) => {
  const response = await fetch(`${API_URL}/auth/google-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, role }),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Google registration failed')
  }

  return data
}

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    const err: any = new Error(data?.message || 'Login failed')
    err.code = data?.code
    throw err
  }

  return data
}

export const forgetPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/forget-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to send reset email')
  }

  return data
}

export const resetPassword = async (token: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Password reset failed')
  }

  return data
}

export const getProfile = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    const err: any = new Error(data?.message || data?.error || 'Failed to fetch profile')
    err.status = response.status
    throw err
  }

  return data
}

export const updateProfile = async (token: string, profileData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
}) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to update profile')
  }

  return data
}

export const changePassword = async (token: string, passwords: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwords),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to change password')
  }

  return data
}

export const getUserStats = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch user stats')
  }

  return data
}

export const setPassword = async (token: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to set password')
  }

  return data
}

export const checkUserExists = async (email: string): Promise<{ type: 'staff' | 'student' } | null> => {
  const response = await fetch(`${API_URL}/auth/check-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to check user')
  }

  if (!data?.exists) return null
  return { type: data.type }
}

export const getGoogleUserInfo = async (accessToken: string) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to fetch Google user info')
  }

  return data
}

// --- User Management API Calls ---

export const getUsers = async (token: string, role?: string, limit?: number) => {
  let url = `${API_URL}/auth/users`
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  if (limit) params.append('limit', limit.toString())

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch users')
  }

  return data
}

export const updateUserRole = async (token: string, id: string, role: string) => {
  const response = await fetch(`${API_URL}/auth/users/${id}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to update user role')
  }

  return data
}

export const deleteUser = async (token: string, id: string) => {
  const response = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to delete user')
  }

  return data
}
