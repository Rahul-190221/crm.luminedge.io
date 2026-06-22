import Cookies from 'js-cookie'
import { API_URL } from '@/lib/api/base'
import { getUserIdFromToken } from '@/lib/helpers/jwt'

export async function logout() {
  const staffToken = Cookies.get('accessToken') || (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null)
  const studentToken = Cookies.get('studentToken') || (typeof localStorage !== 'undefined' ? localStorage.getItem('studentToken') : null)
  const token = staffToken || studentToken

  if (token) {
    const decoded = getUserIdFromToken()
    const endpoint = decoded?.role === 'student' ? '/student/auth/logout' : '/auth/logout'
    try {
      await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
    } catch { /* best-effort server logout — local cleanup always runs */ }
  }

  Cookies.remove('accessToken')
  Cookies.remove('studentToken')
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('studentToken')
    localStorage.removeItem('user')
  }
}
