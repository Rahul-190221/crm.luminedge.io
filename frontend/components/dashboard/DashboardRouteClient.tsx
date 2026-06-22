'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Sidebar from '@/components/layout/Sidebar'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Header from '@/components/layout/Header'
import Dashboard from '@/components/dashboard/Dashboard'
import BDMDashboard from '@/components/dashboard/BDMDashboard'
import LeadCenter from '@/components/leads/LeadCenter'
import InputLead from '@/components/leads/InputLead'
import LeadStage from '@/components/leads/LeadStage'
import CourseDetails from '@/components/admin/CourseDetails'
import MockTest from '@/components/admin/MockTest'
import ExamRegistration from '@/components/admin/ExamRegistration'
import NotificationsPage from '@/components/shared/NotificationsPage'
import ProfilePage from '@/components/shared/ProfilePage'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import { useNotifications } from '@/components/providers/NotificationProvider'
import type { Page } from '@/types/navigation'

export default function DashboardRouteClient() {
  const router = useRouter()
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const decoded = getUserIdFromToken()

    if (!decoded) {
      router.push('/')
      return
    }

    setUser({
      name: decoded.email?.split('@')[0] || 'User',
      email: decoded.email,
      role: decoded.role
    })
    setIsInitialized(true)
  }, [router])

  const handleLogout = () => {
    setUser(null)
    Cookies.remove('accessToken')
    localStorage.removeItem('accessToken')
    router.push('/')
  }

  const handleNotificationClick = () => {
    setActivePage('notification')
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return user?.role === 'admin' ? <Dashboard /> : <BDMDashboard />
      case 'lead-center':
        return <LeadCenter />
      case 'input-lead':
        return <InputLead onSuccess={() => setActivePage('lead-center')} onCancel={() => setActivePage('lead-center')} />
      case 'lead-stage':
        return <LeadStage />
      case 'course-details':
        return <CourseDetails />
      case 'mock-test':
        return <MockTest />
      case 'exam-reg':
        return <ExamRegistration />
      case 'notification':
        return <NotificationsPage />
      case 'profile':
        return <ProfilePage />
      default:
        return user?.role === 'admin' ? <Dashboard /> : <BDMDashboard />
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">Loading...</div>
          <p className="text-gray-500">Redirecting to login</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {user?.role === 'admin' ? (
        <AdminSidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount} />
      ) : (
        <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header user={user} onLogout={handleLogout} onMenuToggle={() => setSidebarOpen(prev => !prev)} unreadCount={unreadCount} onNotificationClick={handleNotificationClick} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-hide bg-[#fafafa]">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
