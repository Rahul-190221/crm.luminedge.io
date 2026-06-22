'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api/notifications'
import { useSocket } from '@/components/providers/SocketProvider'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'

interface Notification {
  _id: string
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  createdAt: string
  isRead: boolean
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const socketService = useSocket()

  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    // 1. Fetch historical from API
    const fetchNotifs = async () => {
      const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
      if (token) {
        try {
          const res = await getNotifications(token)
          setNotifications(res.data || [])
        } catch (error) {
          console.error("Failed to load notifications", error)
        }
      }
    }
    fetchNotifs()
  }, [])

  useEffect(() => {
    // 2. Listen to websocket for live incoming notifications
    if (socketService?.socket) {
      const handleNewNotification = (newNotif: Notification) => {
        setNotifications(prev => [newNotif, ...prev])
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5 border border-[#FACE39] bg-[#FACE39]/10 rounded-full p-2">
                  <Bell className="w-5 h-5 text-[#00000F]" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {newNotif.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {newNotif.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      }

      socketService.socket.on('new-notification', handleNewNotification)

      return () => {
        socketService.socket?.off('new-notification', handleNewNotification)
      }
    }
  }, [socketService?.socket])

  const handleMarkAllAsRead = async () => {
    try {
      const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
      if (token) {
        await markAllNotificationsAsRead(token)
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return; // Don't call API if already read
    try {
      const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
      if (token) {
        await markNotificationAsRead(token, id)
        setNotifications(notifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        ))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteNotification = (id: string) => {
    // If backend implements delete, wire it here. Otherwise, hide locally.
    setNotifications(notifications.filter(n => n._id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBorderColor = (notification: Notification) => {
    if (!notification.isRead) {
      return 'border-l-4 border-l-[#FACE39] bg-[#FACE39]/5'
    }
    return 'border-l-4 border-l-transparent bg-white'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FACE39]/10 rounded-lg">
            <Bell className="w-6 h-6 text-[#00000F]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`relative p-4 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md cursor-pointer ${getBorderColor(notification)}`}
              onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification._id)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="absolute top-4 right-12">
                    <span className="w-2 h-2 bg-red-500 rounded-full block"></span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
