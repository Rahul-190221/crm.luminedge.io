'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Activity,
    LogOut,
    ChevronDown,
    GraduationCap,
    ClipboardCheck,
    FileBadge,
    Bell,
    UserPlus,
    UserX,
    FileText,
    X,
    ChevronLeft,
    GraduationCap as StudentIcon,
    FolderOpen,
    BarChart3,
    Calendar,
    Newspaper,
} from 'lucide-react'
import type { Page } from '@/types/navigation'
import { useSocket } from '@/components/providers/SocketProvider'

interface AdminSidebarProps {
    activePage: Page
    setActivePage: (page: Page) => void
    onLogout: () => void
    isOpen: boolean
    onClose: () => void
    unreadCount: number
    pendingEditCount?: number
    user?: { name: string; email?: string; role?: string } | null
}

export default function AdminSidebar({ activePage, setActivePage, onLogout, isOpen, onClose, unreadCount, pendingEditCount = 0, user }: AdminSidebarProps) {
    const [isServicesOpen, setIsServicesOpen] = useState(false)
    const [isBDMManagementOpen, setIsBDMManagementOpen] = useState(false)
    const [isStudentsOpen, setIsStudentsOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const isIconOnly = collapsed

    useSocket()

    const handleNavigate = (page: Page) => {
        setActivePage(page)
        onClose()
    }

    const servicesItems = [
        { id: 'course-details', label: 'Course Details', icon: GraduationCap },
        { id: 'mock-test',      label: 'Mock Test',      icon: ClipboardCheck },
        { id: 'exam-reg',       label: 'Exam Reg',       icon: FileBadge },
    ]

    const bdmManagementItems = [
        { id: 'bdm-add',      label: 'BDM Add',      icon: UserPlus },
        { id: 'bdm-remove',   label: 'BDM Remove',   icon: UserX },
        { id: 'bdm-activity', label: 'BDM Activity', icon: Activity },
        { id: 'bdm-report',   label: 'BDM Report',   icon: FileText },
    ]

    const NavItem = ({
        id, label, icon: Icon, isSub = false, badge = 0
    }: { id: string; label: string; icon: any; isSub?: boolean; badge?: number }) => {
        const isActive = activePage === id
        return (
            <button
                onClick={() => handleNavigate(id as Page)}
                className={`relative sidebar-hover-liquid w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-left select-none
                    ${isSub
                        ? isIconOnly
                            ? 'justify-center p-2.5 text-[13px] font-medium'
                            : 'pl-[46px] pr-3 py-2 text-[13px] font-medium'
                        : isIconOnly
                            ? 'justify-center p-2.5 text-[14px] font-medium'
                            : 'pl-4 pr-3 py-[10px] text-[14px] font-medium'
                    }
                    ${isActive
                        ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-200'
                        : 'text-gray-500 hover:bg-gray-50/80 hover:text-blue-700 hover:ring-1 hover:ring-gray-200'
                    }`}
            >
                <span className="relative flex-shrink-0">
                    <Icon style={{ width: isSub ? 13 : 15, height: isSub ? 13 : 15 }} />
                    {isIconOnly && badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full px-0.5">
                            {badge > 9 ? '9+' : badge}
                        </span>
                    )}
                </span>
                {!isIconOnly && <span className="truncate flex-1">{label}</span>}
                {!isIconOnly && badge > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold px-1 flex-shrink-0">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
                {isActive && !isSub && !isIconOnly && badge === 0 && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600/30 flex-shrink-0" />
                )}
            </button>
        )
    }

    const SectionLabel = ({ label }: { label: string }) => (
        isIconOnly ? <div className="h-3 mt-1 border-t border-gray-100" /> : (
            <p className="pl-4 pt-5 pb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-gray-400 select-none">
                {label}
            </p>
        )
    )

    const AccordionBtn = ({
        label, icon: Icon, isOpen, onToggle
    }: { label: string; icon: any; isOpen: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`sidebar-hover-liquid w-full flex items-center rounded-xl text-[14px] font-medium transition-all duration-200 select-none
                ${isOpen
                    ? 'text-blue-700/80 bg-blue-50/80'
                : 'text-gray-500 hover:bg-gray-50/80 hover:text-blue-700'
              }
                                ${isIconOnly ? 'justify-center p-2.5' : 'justify-between pl-4 pr-3 py-[10px]'}`}
        >
            <span className="flex items-center gap-3">
                <Icon style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                {!isIconOnly && label}
            </span>
            {!isIconOnly && (
                <ChevronDown
                    style={{ width: 13, height: 13 }}
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-300'}`}
                />
            )}
        </button>
    )

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed top-0 left-0 h-full z-50
                lg:static lg:z-auto lg:translate-x-0
                flex-shrink-0 flex flex-col
                bg-white border-r border-[#00000F]/[0.07]
                shadow-[3px_0_24px_rgba(0,0,0,0.05)]
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{ width: isIconOnly ? 72 : 252, minWidth: isIconOnly ? 72 : 252 }}>
                {/* Logo */}
                <div className="relative flex items-center justify-center px-4 py-[14px] border-b border-[#00000F]/[0.06]">
                    <div className="flex items-center justify-center">
                        <img
                            src="/assets/logo.png"
                            alt="Luminedge"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                    {isOpen && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                            <X style={{ width: 15, height: 15 }} />
                        </button>
                    )}
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 bg-white transition"
                        style={{
                            border: "1px solid #e8e8e8",
                            boxShadow: "0 2px 8px rgba(0,0,15,0.10)",
                        }}
                    >
                        <ChevronLeft style={{ width: 12, height: 12, transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto scrollbar-hide pb-3 ${isIconOnly ? 'px-2' : 'px-2.5'}`}>
                    <SectionLabel label="Overview" />
                    <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />

                    <SectionLabel label="Services" />
                    <AccordionBtn
                        label="Services"
                        icon={Briefcase}
                        isOpen={isServicesOpen}
                        onToggle={() => setIsServicesOpen(v => !v)}
                    />
                    {isServicesOpen && (
                        <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-blue-200/50 space-y-0.5">
                            {servicesItems.map(item => (
                                <NavItem key={item.id} id={item.id} label={item.label} icon={item.icon} isSub />
                            ))}
                        </div>
                    )}

                    <div className="mt-0.5">
                        <NavItem id="lead-center" label="Lead Center" icon={Users} />
                    </div>

                    <SectionLabel label="Analytics" />
                    <NavItem id="reports" label="Reports" icon={BarChart3} />

                    {/* <SectionLabel label="Students" />
                    <AccordionBtn
                        label="Students"
                        icon={StudentIcon}
                        isOpen={isStudentsOpen}
                        onToggle={() => setIsStudentsOpen(v => !v)}
                    />
                    {isStudentsOpen && (
                        <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-blue-200/50 space-y-0.5">
                            <NavItem id="student-list" label="All Students" icon={Users} isSub />
                            <NavItem id="student-applications" label="Applications" icon={FileText} isSub />
                            <NavItem id="student-documents" label="Documents Review" icon={FolderOpen} isSub />
                            <NavItem id="milestones" label="Milestones" icon={BarChart3} isSub />
                            <NavItem id="appointments-admin" label="Appointments" icon={Calendar} isSub />
                            <NavItem id="news-management" label="News Management" icon={Newspaper} isSub />
                        </div>
                    )} */}

                    <SectionLabel label="Management" />
                    {/* Create Staff Account
                    <Link
                        href="/admin/users/create"
                        className={`sidebar-hover-liquid w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-left select-none text-gray-500 hover:bg-gray-50/80 hover:text-blue-700 ${isIconOnly ? 'justify-center p-2.5 text-[14px] font-medium' : 'pl-4 pr-3 py-[10px] text-[14px] font-medium'}`}
                    >
                        <UserPlus style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                        {!isIconOnly && <span className="truncate">Create Staff</span>}
                    </Link> */}
                    <AccordionBtn
                        label="BDM Management"
                        icon={Users}
                        isOpen={isBDMManagementOpen}
                        onToggle={() => setIsBDMManagementOpen(v => !v)}
                    />
                    {isBDMManagementOpen && (
                        <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-blue-200/50 space-y-0.5">
                            {bdmManagementItems.map(item => (
                                <NavItem key={item.id} id={item.id} label={item.label} icon={item.icon} isSub />
                            ))}
                        </div>
                    )}

                    <div className="mt-1.5">
                        <NavItem id="edit-request" label="Edit Request" icon={ClipboardCheck} badge={pendingEditCount} />
                    </div>
                </nav>

                {/* Footer */}
                <div className={`pt-2 pb-5 border-t border-[#00000F]/[0.06] ${isIconOnly ? 'px-2' : 'px-2.5'}`}>
                    <div className="space-y-[2px]">
                        <NavItem
                            id="notification"
                            label="Notifications"
                            icon={Bell}
                            badge={unreadCount}
                        />

                        {/* Profile card */}
                        <button
                            onClick={() => handleNavigate('profile')}
                            className={`group relative overflow-hidden sidebar-hover-liquid w-full flex items-center rounded-xl transition-all duration-200 select-none
                                ${activePage === 'profile'
                                    ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-blue-700 hover:ring-1 hover:ring-gray-200'
                                }
                                ${isIconOnly ? 'justify-center p-2.5' : 'gap-3 pl-3 pr-3 py-2'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 ring-2 ring-blue-100">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            {!isIconOnly && (
                                <div className="flex flex-col min-w-0 text-left">
                                    <span className="text-[13px] font-bold truncate leading-tight">
                                        {user?.name || 'Admin'}
                                    </span>
                                    <span className="text-[10.5px] text-gray-400 font-medium">
                                        {user?.role || 'Admin'}
                                    </span>
                                </div>
                            )}
                        </button>

                        <div className="pt-1 mt-1 border-t border-[#00000F]/[0.05]">
                            <button
                                onClick={onLogout}
                                className={`group relative overflow-hidden sidebar-hover-liquid w-full flex items-center rounded-xl text-rose-500 bg-rose-50/60 ring-1 ring-rose-100 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-200 select-none ${isIconOnly ? 'justify-center p-2.5' : 'gap-3 pl-4 pr-3 py-2.5'}`}
                            >
                                <LogOut style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                                {!isIconOnly && <span className="text-[13.5px] font-bold tracking-wide">Logout</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}




