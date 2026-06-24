'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import type { Page } from '@/types/navigation'

interface SidebarProps {
  activePage: Page
  setActivePage: (page: Page) => void
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
  unreadCount: number
  user?: { name: string; role?: string; email?: string }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0] ?? '')
    .join('')
    .toUpperCase()
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-2" />
  return <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.7px] text-gray-400 select-none">{label}</div>
}

function NavItem({
  id,
  label,
  Icon,
  activePage,
  collapsed,
  badge,
  badgeColor = 'red',
  onClick,
}: {
  id: Page
  label: string
  Icon: React.ElementType
  activePage: Page
  collapsed: boolean
  badge?: number
  badgeColor?: 'red' | 'green'
  onClick: (page: Page) => void
}) {
  const active = activePage === id || (id === 'lead-center' && activePage === 'lead-detail')

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      title={collapsed ? label : undefined}
      className={`
        relative w-full flex items-center rounded-lg transition-colors select-none text-left
        ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5'}
        border-l-4 ${active ? 'border-[#1a56db] bg-[#ebf0ff] text-[#1a56db] font-semibold shadow-sm' : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'}
      `}
    >
      <Icon className={`flex-shrink-0 ${collapsed ? 'w-[17px] h-[17px]' : 'w-4 h-4'}`} />
      {!collapsed && <span className="flex-1 text-[13px] truncate">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${badgeColor === 'green' ? 'bg-[#0e9f6e]' : 'bg-[#e02424]'}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {collapsed && badge !== undefined && badge > 0 && (
        <span className={`absolute translate-x-[12px] -translate-y-[12px] w-2 h-2 rounded-full ${badgeColor === 'green' ? 'bg-[#0e9f6e]' : 'bg-[#e02424]'}`} />
      )}
    </button>
  )
}

export default function Sidebar({
  activePage,
  setActivePage,
  onLogout,
  isOpen,
  onClose,
  unreadCount,
  user,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const width = collapsed ? 68 : 220

  const nav = (page: Page) => {
    setActivePage(page)
    onClose()
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[3px] lg:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width, minWidth: width }}
      >
        <div className="relative flex items-center justify-center px-4 py-[14px] border-b border-gray-200">
          <div className="flex items-center justify-center min-w-0">
            <img
              src="/assets/logo.png"
              alt="Luminedge"
              className={`object-contain ${collapsed ? 'h-8 w-auto' : 'h-11 w-auto'}`}
            />
          </div>

          {isOpen && (
            <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <ChevronLeft className="w-3 h-3" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" style={{ scrollbarWidth: 'none' }}>
          {!collapsed && <p className="px-3 pt-1 pb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-gray-300 select-none">Overview</p>}
          <div className="space-y-0.5">
            <NavItem id="dashboard" label="Dashboard" Icon={LayoutDashboard} activePage={activePage} collapsed={collapsed} onClick={nav} />
          </div>

          {!collapsed ? <p className="px-3 pt-4 pb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-gray-300 select-none">Pipeline</p> : <div className="h-3 mt-1 mx-1 border-t border-gray-100" />}
          <div className="space-y-0.5">
            <NavItem id="bdm-pipeline" label="Lead Pipeline" Icon={Columns2} activePage={activePage} collapsed={collapsed} onClick={nav} badge={unreadCount > 0 ? unreadCount : undefined} />
            <NavItem id="lead-center" label="Students" Icon={Users} activePage={activePage} collapsed={collapsed} onClick={nav} badgeColor="green" />
            <NavItem id="course-details" label="Batches" Icon={Monitor} activePage={activePage} collapsed={collapsed} onClick={nav} />
          </div>

          {!collapsed ? <p className="px-3 pt-4 pb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-gray-300 select-none">Analytics</p> : <div className="h-3 mt-1 mx-1 border-t border-gray-100" />}
          <div className="space-y-0.5">
            <NavItem id="bdm-exam-slots" label="Exam Slots" Icon={CalendarDays} activePage={activePage} collapsed={collapsed} onClick={nav} />
            <NavItem id="bdm-reports" label="Reports" Icon={BarChart3} activePage={activePage} collapsed={collapsed} onClick={nav} />
          </div>

          {!collapsed ? <p className="px-3 pt-4 pb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-gray-300 select-none">Account</p> : <div className="h-3 mt-1 mx-1 border-t border-gray-100" />}
          <div className="space-y-0.5">
            <NavItem id="notification" label="Follow-ups" Icon={Bell} activePage={activePage} collapsed={collapsed} onClick={nav} badge={unreadCount} />
          </div>
        </nav>

        <div className="border-t border-gray-200 p-3">
          {!collapsed ? (
            <button
              type="button"
              onClick={() => nav('profile')}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a56db] text-white flex items-center justify-center text-[11px] font-bold">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-gray-800 truncate">{user?.name || 'BDM User'}</div>
                <div className="text-[11px] text-gray-400">BDM - Luminedge</div>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => nav('profile')}
              className="w-full flex items-center justify-center py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a56db] text-white flex items-center justify-center text-[11px] font-bold">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className={`w-full mt-1 flex items-center rounded-lg text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-[#e02424] transition-colors ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5'}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}



