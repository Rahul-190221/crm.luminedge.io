'use client'

import {
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  ChevronDown,
  ChevronLeft,
  GraduationCap,
  ClipboardCheck,
  FileBadge,
  Bell,
  UserCircle,
  FileText,
  FolderOpen,
  BarChart3,
  Calendar,
  Newspaper,
  X
} from 'lucide-react'
import type { Page } from '@/types/navigation'
import { useSocket } from '@/components/providers/SocketProvider'
import { useState } from 'react'

interface SidebarProps {
  activePage: Page
  setActivePage: (page: Page) => void
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
  unreadCount: number
}

export default function Sidebar({ activePage, setActivePage, onLogout, isOpen, onClose, unreadCount }: SidebarProps) {
  const [isServicesOpen, setIsServicesOpen] = useState(true)
  const [isStudentsOpen, setIsStudentsOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const isIconOnly = collapsed
  useSocket()

  const nav = (page: Page) => { setActivePage(page); onClose() }

  const Item = ({
    id, label, Icon, sub = false
  }: { id: Page; label: string; Icon: any; sub?: boolean }) => {
    const active = activePage === id || (id === 'lead-center' && activePage === 'lead-detail')
  return (
      <button
        onClick={() => nav(id)}
        className={`sidebar-hover-liquid w-full flex items-center rounded-xl transition-all duration-200 select-none
          ${sub
            ? isIconOnly
              ? 'justify-center p-2.5'
              : 'pl-4 pr-3 py-2 gap-2.5 text-[12.5px] font-medium'
            : isIconOnly
              ? 'justify-center p-2.5'
              : 'pl-4 pr-3 py-[10px] gap-3 text-[13.5px] font-medium'
          }
          ${active
            ? 'bg-[#FACE39] text-[#00000F] font-bold shadow-[0_4px_14px_rgba(250,206,57,0.28)]'
            : 'text-[#00000F]/65 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]'
          }`}
      >
        <Icon style={{ width: sub ? 13 : 15, height: sub ? 13 : 15 }} className="flex-shrink-0" />
        {!isIconOnly && <span className="truncate">{label}</span>}
        {active && !sub && !isIconOnly && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00000F]/20 flex-shrink-0" />}
      </button>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => (
    isIconOnly ? <div className="h-2" /> : (
      <p className="pl-4 pt-5 pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#00000F]/20 select-none">
        {label}
      </p>
    )
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
        fixed top-0 left-0 h-full z-50 lg:static lg:z-auto lg:translate-x-0
        flex-shrink-0 flex flex-col
        bg-white border-r border-[#00000F]/[0.07]
        shadow-[3px_0_24px_rgba(0,0,0,0.05)]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ width: isIconOnly ? 72 : 252, minWidth: isIconOnly ? 72 : 252 }}>

        {/* Logo */}
        <div className="relative flex items-center justify-between px-4 py-4 border-b border-[#00000F]/[0.06]">
          <div className={`flex-1 flex items-center ${isIconOnly ? 'justify-center' : 'justify-center mr-2'}`}>
            <img
              src="/assets/logo.png"
              alt="Luminedge"
              className={isIconOnly ? "h-9 w-9 object-contain" : "h-14 w-auto object-contain"}
              style={{ imageRendering: 'auto' }}
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
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[#00000F]/40 hover:text-[#00000F]/70 bg-white transition"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 2px 8px rgba(0,0,15,0.10)",
            }}
          >
            <ChevronLeft style={{ width: 12, height: 12, transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }} />
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto scrollbar-hide pb-3 ${isIconOnly ? 'px-2' : 'px-2.5'}`}>
          <SectionLabel label="Overview" />
          <Item id="dashboard" label="Dashboard" Icon={LayoutDashboard} />

          <SectionLabel label="Services" />
          <button
            onClick={() => setIsServicesOpen(v => !v)}
            className={`sidebar-hover-liquid w-full flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-200 select-none
                ${isIconOnly ? 'justify-center p-2.5' : 'justify-between pl-4 pr-3 py-[10px]'}
          ${isServicesOpen
            ? 'text-[#00000F]/80 bg-[#FACE39]/[0.08]'
            : 'text-[#00000F]/65 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]'
          }`}
      >
        <span className={`flex items-center ${isIconOnly ? 'gap-0' : 'gap-3'}`}>
              <Briefcase style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              {!isIconOnly && 'Services'}
            </span>
            {!isIconOnly && (
              <ChevronDown
                style={{ width: 13, height: 13 }}
                className={`flex-shrink-0 transition-transform duration-200 ${isServicesOpen ? 'rotate-180 text-[#00000F]/50' : 'text-gray-300'}`}
              />
            )}
          </button>
          {isServicesOpen && (
            <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-[#FACE39]/30 space-y-0.5">
              <Item id="course-details"  label="Course Details"    Icon={GraduationCap} sub />
              <Item id="mock-test"       label="Mock Test"         Icon={ClipboardCheck} sub />
              <Item id="exam-reg"        label="Exam Registration" Icon={FileBadge} sub />
            </div>
          )}

          {/* <SectionLabel label="Students" />
          <button
            onClick={() => setIsStudentsOpen(v => !v)}
            className={`sidebar-hover-liquid w-full flex items-center rounded-xl text-[14px] font-medium transition-all duration-200 select-none
                ${isIconOnly ? 'justify-center p-2.5' : 'justify-between pl-4 pr-3 py-[10px]'}
          ${isStudentsOpen
            ? 'text-[#00000F]/80 bg-[#FACE39]/[0.08]'
            : 'text-[#00000F] hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]'
          }`}
          >
            <span className={`flex items-center ${isIconOnly ? 'gap-0' : 'gap-3'}`}>
              <GraduationCap style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              {!isIconOnly && 'Students'}
            </span>
            {!isIconOnly && (
              <ChevronDown
                style={{ width: 13, height: 13 }}
                className={`flex-shrink-0 transition-transform duration-200 ${isStudentsOpen ? 'rotate-180 text-[#00000F]/50' : 'text-gray-300'}`}
              />
            )}
          </button>
          {isStudentsOpen && (
            <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-[#FACE39]/30 space-y-0.5">
              <Item id="student-list"        label="All Students"      Icon={Users} sub />
              <Item id="student-applications" label="Applications"      Icon={FileText} sub />
              <Item id="student-documents"    label="Documents Review"  Icon={FolderOpen} sub />
              <Item id="milestones"           label="Milestones"        Icon={BarChart3} sub />
              <Item id="appointments-admin"   label="Appointments"      Icon={Calendar} sub />
              <Item id="news-management"     label="News Management"   Icon={Newspaper} sub />
            </div>
          )} */}

        <div className="mt-0.5">
          <Item id="lead-center" label="Lead Center" Icon={Users} />
        </div>
        <div className="mt-0.5">
          <button
                onClick={() => nav('notification')}
                className={`sidebar-hover-liquid w-full flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-200 select-none
                  ${activePage === 'notification'
                    ? 'bg-[#FACE39] text-[#00000F] font-bold shadow-[0_4px_14px_rgba(250,206,57,0.28)]'
                    : 'text-[#00000F]/65 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]'
                  }
                  ${isIconOnly ? 'justify-center px-2 py-[10px]' : 'justify-between pl-4 pr-3 py-[10px]'}`}
              >
                <span className={`flex items-center ${isIconOnly ? 'gap-0' : 'gap-3'}`}>
                  <Bell style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                  {!isIconOnly && 'Follow up'}
                </span>
                {unreadCount > 0 && !isIconOnly && (
                  <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
          </button>
        </div>
        </nav>

        {/* Footer */}
        <div className={`pt-3 pb-5 border-t border-[#00000F]/[0.06] ${isIconOnly ? 'px-2' : 'px-2.5'}`}>
          {!isIconOnly && <p className="pl-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#00000F]/20 select-none">Account</p>}
          <div className="space-y-0.5">
           
            <button
              onClick={() => nav('profile')}
              className={`sidebar-hover-liquid w-full flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-200 select-none
                ${activePage === 'profile'
                  ? 'bg-[#FACE39] text-[#00000F] font-bold shadow-[0_4px_14px_rgba(250,206,57,0.28)]'
                  : 'text-[#00000F]/65 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]'
                }
                ${isIconOnly ? 'justify-center p-2.5' : 'justify-start gap-3 pl-4 pr-3 py-[10px]'}`}
            >
              <UserCircle style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              {!isIconOnly && 'Profile'}
            </button>

            <div className="pt-1.5 border-t border-[#00000F]/[0.05] mt-1.5">
              <button
                onClick={onLogout}
              className={`sidebar-hover-liquid w-full flex items-center rounded-xl text-[13.5px] font-medium text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-200 select-none ${isIconOnly ? 'justify-center p-2.5' : 'justify-start gap-3 pl-4 pr-3 py-[10px]'}`}
              >
                <LogOut style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                {!isIconOnly && 'Logout'}
            </button>
          </div>
        </div>
        </div>

      </div>
    </>
  )
}
