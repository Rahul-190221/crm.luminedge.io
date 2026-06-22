'use client'

import React from 'react'
import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNotifications } from '@/components/providers/NotificationProvider'

const TYPE_CONFIG = {
    success: {
        Icon: CheckCircle,
        iconBg: 'bg-emerald-50 border-emerald-200/60',
        iconColor: 'text-emerald-600',
        accent: '#10B981',
        badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
        label: 'Success',
    },
    warning: {
        Icon: AlertCircle,
        iconBg: 'bg-amber-50 border-amber-200/60',
        iconColor: 'text-amber-600',
        accent: '#F59E0B',
        badge: 'bg-amber-50 text-amber-700 border border-amber-200/60',
        label: 'Warning',
    },
    error: {
        Icon: AlertCircle,
        iconBg: 'bg-rose-50 border-rose-200/60',
        iconColor: 'text-rose-600',
        accent: '#EF4444',
        badge: 'bg-rose-50 text-rose-700 border border-rose-200/60',
        label: 'Alert',
    },
    info: {
        Icon: Info,
        iconBg: 'bg-blue-50 border-blue-200/60',
        iconColor: 'text-blue-600',
        accent: '#3B82F6',
        badge: 'bg-blue-50 text-blue-700 border border-blue-200/60',
        label: 'Info',
    },
}

export default function NotificationsPage() {
    const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications()

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead()
            toast.success('All marked as read')
        } catch {
            toast.error('Failed to mark all as read')
        }
    }

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return `${Math.floor(diffInSeconds / 86400)}d ago`
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-3">
                <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100" />
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-gray-100 rounded-md" />
                            <div className="h-3 w-20 bg-gray-100 rounded-md" />
                        </div>
                    </div>
                    <div className="h-8 w-28 bg-gray-100 rounded-xl" />
                </div>
                {[1, 2, 3].map(n => (
                    <div key={n} className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 flex gap-4 animate-pulse">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
                        <div className="flex-1 space-y-2.5">
                            <div className="flex gap-2 items-center">
                                <div className="h-3.5 w-1/3 bg-gray-100 rounded" />
                                <div className="h-3.5 w-14 bg-gray-100 rounded-full" />
                            </div>
                            <div className="h-3 w-2/3 bg-gray-100 rounded" />
                            <div className="h-3 w-16 bg-gray-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className="max-w-2xl mx-auto space-y-3">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FACE39]/15 border border-[#FACE39]/25 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-[18px] h-[18px] text-[#00000F]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[15px] font-bold text-[#00000F]/85 tracking-tight">Notifications</h1>
                                {notifications.length > 0 && (
                                    <span className="text-[12px] font-bold bg-[#00000F]/[0.06] text-[#00000F]/45 px-2 py-0.5 rounded-full tabular-nums">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 ? (
                                <p className="text-[13px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse inline-block" />
                                    {unreadCount} unread
                                </p>
                            ) : (
                                <p className="text-[13px] text-emerald-600 font-semibold mt-0.5">All caught up</p>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="shrink-0 px-4 py-2 bg-[#00000F] text-[#FACE39] text-xs font-bold rounded-xl hover:bg-[#00000F]/90 transition-all shadow-sm active:scale-[0.97]"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Empty state */}
            {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] py-16 px-6 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-5">
                        <div className="absolute inset-0 bg-[#FACE39]/15 rounded-2xl animate-ping opacity-50" />
                        <div className="relative w-16 h-16 bg-[#00000F] rounded-2xl flex items-center justify-center shadow-lg">
                            <Bell className="w-7 h-7 text-[#FACE39]" />
                        </div>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#00000F]/75 mb-1.5">No notifications yet</h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                        You&apos;ll be notified here when important updates happen with your leads or account.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => {
                        const cfg = TYPE_CONFIG[notification.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.info
                        const IconComp = cfg.Icon
                        return (
                            <div
                                key={notification._id}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                                className={`group relative bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200
                                    ${notification.isRead
                                        ? 'border-[#00000F]/[0.06] opacity-60 hover:opacity-85 hover:shadow-sm'
                                        : 'border-[#00000F]/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] hover:-translate-y-px'
                                    }`}
                            >
                                {/* Top accent stripe for unread */}
                                {!notification.isRead && (
                                    <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl" style={{ backgroundColor: cfg.accent }} />
                                )}

                                <div className="p-4 sm:p-5 flex gap-3.5 items-start">
                                    {/* Icon badge */}
                                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${cfg.iconBg}`}>
                                        <IconComp className={`w-4 h-4 ${cfg.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`text-[13px] font-bold tracking-tight ${notification.isRead ? 'text-[#00000F]/50' : 'text-[#00000F]/85'}`}>
                                                {notification.title}
                                            </span>
                                            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.badge}`}>
                                                {cfg.label}
                                            </span>
                                            {!notification.isRead && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className={`text-[13px] leading-relaxed mb-2.5 ${notification.isRead ? 'text-gray-400' : 'text-[#00000F]/55 font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                                                <Clock className="w-3 h-3" />
                                                {getTimeAgo(notification.createdAt)}
                                            </span>
                                            {!notification.isRead && (
                                                <span className="text-[12px] font-bold text-[#00000F]/65 group-hover:text-[#00000F] bg-[#FACE39]/65 group-hover:bg-[#FACE39] px-2.5 py-1 rounded-lg transition-colors">
                                                    Mark read
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
