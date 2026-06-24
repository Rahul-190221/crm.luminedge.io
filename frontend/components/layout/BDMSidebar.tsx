'use client'

import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    Columns2,
    Users,
    Monitor,
    CalendarDays,
    BarChart3,
    Bell,
    LogOut,
    ChevronLeft,
    X,
    UserCircle,
    Activity,
} from 'lucide-react'
import type { Page } from '@/types/navigation'
import { useSocket } from '@/components/providers/SocketProvider'
import { getProfile } from '@/lib/api/auth'

interface BDMSidebarProps {
    activePage: Page
    setActivePage: (page: Page) => void
    onLogout: () => void
    isOpen: boolean
    onClose: () => void
    unreadCount: number
}

export default function BDMSidebar({
    activePage,
    setActivePage,
    onLogout,
    isOpen,
    onClose,
    unreadCount,
}: BDMSidebarProps) {
    const [collapsed, setCollapsed] = useState(false)
    const isIconOnly = collapsed
    const [userProfile, setUserProfile] = useState<{ name: string; avatar?: string } | null>(null)

    useSocket()

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        if (!token) return
        getProfile(token)
            .then((data) => {
                const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || data.email || 'User'
                setUserProfile({ name, avatar: data.avatarUrl })
            })
            .catch(() => {})
    }, [])

    const handleNavigate = (page: Page) => {
        setActivePage(page)
        onClose()
    }

    const NavItem = ({
        id,
        label,
        icon: Icon,
        badge,
        badgeColor = 'red',
    }: {
        id: string
        label: string
        icon: any
        badge?: number
        badgeColor?: 'red' | 'green'
    }) => {
        const isActive =
            activePage === id ||
            (id === 'lead-center' && activePage === 'lead-detail')

        return (
            <button
                onClick={() => handleNavigate(id as Page)}
                className={`group relative overflow-hidden flex items-center rounded-[10px] transition-all duration-300 ease-out text-left select-none w-[calc(100%-24px)] ml-4 mr-2
                    ${isIconOnly
                        ? 'justify-center p-2.5 w-[calc(100%-16px)] mx-2'
                        : 'px-4 py-2.5 gap-3.5'
                    }
                    ${isActive
                        ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm ring-1 ring-blue-200'
                        : 'text-gray-500 hover:text-blue-700 hover:shadow-sm hover:bg-gray-50/80 hover:ring-1 hover:ring-gray-200'
                    } hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95`}
            >
                {/* Liquid animation shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                <Icon
                    style={{ width: 18, height: 18 }}
                    className={`flex-shrink-0 relative z-10 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'group-hover:text-blue-600'}`}
                />
                {!isIconOnly && (
                    <>
                        <span className="flex-1 truncate text-[13.5px] font-semibold tracking-wide relative z-10">
                            {label}
                        </span>
                        {badge !== undefined && badge > 0 && (
                            <span
                                className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center text-white flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110
                                    ${badgeColor === 'green' ? 'bg-emerald-500' : 'bg-red-500'}`}
                            >
                                {badge > 99 ? '99+' : badge}
                            </span>
                        )}
                    </>
                )}
                {isIconOnly && badge !== undefined && badge > 0 && (
                    <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-red-500 rounded-full z-10" />
                )}
            </button>
        )
    }

    const SectionLabel = ({ label }: { label: string }) =>
        isIconOnly ? (
            <div className="my-2 mx-3 border-t border-gray-100" />
        ) : (
            <p className="px-7 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 select-none">
                {label}
            </p>
        )

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                    fixed top-0 left-0 h-full z-50
                    lg:static lg:z-auto lg:translate-x-0
                    flex-shrink-0 flex flex-col
                    bg-white border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ width: isIconOnly ? 80 : 260, minWidth: isIconOnly ? 80 : 260 }}
            >
                {/* Logo */}
                <div className="relative flex items-center justify-center py-4 border-b border-gray-100">
                    {!isIconOnly && (
                        <img
                            src="/assets/logo.png"
                            alt="Luminedge"
                            className="h-12 w-auto object-contain"
                        />
                    )}
                    {isIconOnly && <div className="w-full" />}
                    {isOpen && (
                        <button
                            onClick={onClose}
                            className="absolute right-4 lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                            <X style={{ width: 18, height: 16 }} />
                        </button>
                    )}
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-gray-200 items-center justify-center text-gray-400 hover:text-gray-700 shadow-sm transition-colors hidden lg:flex"
                    >
                        <ChevronLeft
                            style={{
                                width: 12,
                                height: 12,
                                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.25s',
                            }}
                        />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto scrollbar-hide pb-3">
                    <SectionLabel label="Main" />
                    <div className="space-y-[2px]">
                        <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                        <NavItem id="bdm-pipeline" label="Lead Pipeline" icon={Columns2} badge={0} />
                        <NavItem id="lead-center" label="Students" icon={Users} badge={0} badgeColor="green" />
                        <NavItem id="course-details" label="Batches" icon={Monitor} />
                    </div>

                    <SectionLabel label="Exams" />
                    <div className="space-y-[2px]">
                        <NavItem id="bdm-exam-slots" label="Exam Slots" icon={CalendarDays} />
                        <NavItem id="bdm-reports" label="Reports" icon={Activity} />
                    </div>

                    <SectionLabel label="Tools" />
                    <div className="space-y-[2px]">
                        <NavItem
                            id="notification"
                            label="Follow-ups"
                            icon={Bell}
                            badge={unreadCount}
                        />
                    </div>
                </nav>

                {/* Footer */}
                <div className="pt-2 pb-5 border-t border-gray-100">
                    <div className="space-y-[2px]">
                        {/* Profile Card */}
                        <button
                            onClick={() => handleNavigate('profile' as Page)}
                            className={`group relative overflow-hidden flex items-center rounded-[10px] transition-all duration-300 ease-out text-left select-none w-[calc(100%-24px)] ml-4 mr-2
                                ${isIconOnly ? 'justify-center p-2.5 w-[calc(100%-16px)] mx-2' : 'px-3 py-2 gap-3'}
                                ${
                                    activePage === 'profile'
                                        ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm ring-1 ring-blue-200'
                                        : 'text-gray-600 hover:text-blue-700 hover:shadow-sm hover:bg-gray-50/80 hover:ring-1 hover:ring-gray-200'
                                } hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95`}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                            {/* Avatar */}
                            {userProfile?.avatar ? (
                                <img
                                    src={userProfile.avatar}
                                    alt={userProfile.name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-100 relative z-10"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 ring-2 ring-blue-100 relative z-10">
                                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            {!isIconOnly && (
                                <div className="flex flex-col min-w-0 relative z-10">
                                    <span className="text-[13px] font-bold truncate leading-tight">
                                        {userProfile?.name || 'Profile'}
                                    </span>
                                    <span className="text-[10.5px] text-gray-400 font-medium">View Profile</span>
                                </div>
                            )}
                        </button>
                        <button
                            onClick={onLogout}
                            className={`group relative overflow-hidden flex items-center rounded-[10px] transition-all duration-300 ease-out select-none w-[calc(100%-24px)] ml-4 mr-2 text-red-500 bg-red-50/60 ring-1 ring-red-100 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95
                                ${isIconOnly ? 'justify-center p-2.5 w-[calc(100%-16px)] mx-2' : 'px-4 py-2.5 gap-3.5'}`}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                            <LogOut style={{ width: 18, height: 18 }} className="flex-shrink-0 relative z-10" />
                            {!isIconOnly && <span className="text-[13.5px] font-bold tracking-wide relative z-10">Logout</span>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
