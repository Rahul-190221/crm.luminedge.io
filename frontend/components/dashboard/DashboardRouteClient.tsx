'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import AdminSidebar from '@/components/layout/AdminSidebar'
import BDMSidebar from '@/components/layout/BDMSidebar'
import Header from '@/components/layout/Header'
import Dashboard from '@/components/dashboard/Dashboard'
import BDMDashboard from '@/components/dashboard/BDMDashboard'
import BDMPipeline from '@/components/dashboard/BDMPipeline'
import BDMExamSlots from '@/components/dashboard/BDMExamSlots'
import BDMReports from '@/components/dashboard/BDMReports'
import LeadCenter from '@/components/leads/LeadCenter'
import InputLead from '@/components/leads/InputLead'
import LeadStage from '@/components/leads/LeadStage'
import CourseDetails from '@/components/admin/CourseDetails'
import MockTest from '@/components/admin/MockTest'
import ExamRegistration from '@/components/admin/ExamRegistration'
import NotificationsPage from '@/components/shared/NotificationsPage'
import FollowUpPage from '@/components/dashboard/FollowUpPage'
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
    if (user?.role === 'admin') {
      switch (activePage) {
        case 'dashboard': return <Dashboard />
        case 'lead-center': return <LeadCenter />
        case 'input-lead': return <InputLead onSuccess={() => setActivePage('lead-center')} onCancel={() => setActivePage('lead-center')} />
        case 'lead-stage': return <LeadStage />
        case 'course-details': return <CourseDetails />
        case 'mock-test': return <MockTest />
        case 'exam-reg': return <ExamRegistration />
        case 'notification': return <NotificationsPage />
        case 'profile': return <ProfilePage />
        default: return <Dashboard />
      }
    }

    // BDM routes
    switch (activePage) {
      case 'dashboard':
        return (
          <BDMDashboard
            userName={user?.name}
            setActivePage={setActivePage}
            onViewLead={() => setActivePage('lead-center')}
            onViewAllLeads={() => setActivePage('notification')}
            onBookExam={() => setActivePage('bdm-exam-slots')}
            onNewLeadsToday={() => setActivePage('bdm-pipeline')}
            onViewMockTests={() => setActivePage('bdm-exam-slots')}
          />
        )
      case 'bdm-pipeline':
        return <BDMPipeline setActivePage={setActivePage} />
      case 'lead-center':
        return <LeadCenter />
      case 'course-details':
        return <CourseDetails />
      case 'bdm-exam-slots':
        return <BDMExamSlots />
      case 'bdm-reports':
        return <BDMReports />
      case 'input-lead':
        return <InputLead onSuccess={() => setActivePage('lead-center')} onCancel={() => setActivePage('lead-center')} />
      case 'lead-stage':
        return <LeadStage />
      case 'notification':
        return <FollowUpPage />
      case 'profile':
        return <ProfilePage />
      default:
        return (
          <BDMDashboard
            userName={user?.name}
            setActivePage={setActivePage}
            onViewLead={() => setActivePage('lead-center')}
            onViewAllLeads={() => setActivePage('notification')}
            onBookExam={() => setActivePage('bdm-exam-slots')}
            onNewLeadsToday={() => setActivePage('bdm-pipeline')}
            onViewMockTests={() => setActivePage('bdm-exam-slots')}
          />
        )
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-11 w-11 border-2 border-[#1a56db] border-t-[#00000f] mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#00000f]/70">Opening your workspace…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {user?.role === 'admin' ? (
        <AdminSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadCount={unreadCount}
        />
      ) : (
        <BDMSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadCount={unreadCount}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!(user?.role !== 'admin' && activePage === 'dashboard') && (
          <Header
            user={user}
            onLogout={handleLogout}
            onMenuToggle={() => setSidebarOpen(prev => !prev)}
            unreadCount={unreadCount}
            onNotificationClick={handleNotificationClick}
          />
        )}
        <main className="flex-1 overflow-y-auto p-6 pb-12 scrollbar-hide bg-[#f9fafb]">
          <div key={activePage} className="bdm-page-enter">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
