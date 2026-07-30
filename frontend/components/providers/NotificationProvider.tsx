'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api/notifications'
import { useSocket, useSocketTick } from './SocketProvider'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'

// BDMs only use the Follow-up Reminders flow (its own cron-driven fetch/badge in
// useFollowUpLeads); the generic Notification system (fetch, unread badge, toasts) is
// intentionally admin/student-only and never shown on the BDM end.
const isBdmSession = () => getUserIdFromToken()?.role === 'bdm'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error'
  isRead: boolean
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const socketService = useSocket()
  const socketTick = useSocketTick()

  const fetchNotifications = useCallback(async () => {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
    if (!token || isBdmSession()) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const res = await getNotifications(token)
      if (res.success) {
        setNotifications(res.data || [])
        setUnreadCount(res.meta?.unreadCount ?? res.data?.filter((n: any) => !n.isRead).length ?? 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = async (id: string) => {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
    if (!token) return

    try {
      await markNotificationAsRead(token, id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
    if (!token) return

    try {
      await markAllNotificationsAsRead(token)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications, pathname])

  useEffect(() => {
    const handleWindowFocus = () => {
      fetchNotifications()
    }

    window.addEventListener('focus', handleWindowFocus)
    return () => {
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [fetchNotifications])

  // Poll as a fallback for environments where the socket push can't connect
  // (e.g. a serverless API host with no always-on Socket.IO server).
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications()
      }
    }, 20000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    const activeSocket = socketService?.socket
    if (!activeSocket || isBdmSession()) return

    const handleNewNotification = (newNotif: Notification) => {
      let isNewNotification = false

      setNotifications(prev => {
        if (prev.some(notification => notification._id === newNotif._id)) {
          return prev
        }

        isNewNotification = true
        return [newNotif, ...prev]
      })

      if (!isNewNotification) {
        return
      }

      if (!newNotif.isRead) {
        setUnreadCount(prev => prev + 1)
      }

      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5 border border-[#FACE39] bg-[#FACE39]/10 rounded-full p-2">
                <Bell className="w-5 h-5 text-[#00000F]" />
              </div>
              <div className="ml-3 flex-1 text-left">
                <p className="text-sm font-bold text-gray-900">{newNotif.title}</p>
                <p className="mt-1 text-sm text-gray-500">{newNotif.message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 })
    }

    activeSocket.on('new-notification', handleNewNotification)
    return () => {
      activeSocket.off('new-notification', handleNewNotification)
    }
  }, [pathname, socketTick])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
