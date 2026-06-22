'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BDMDashboard from '@/components/dashboard/BDMDashboard'
import LeadCenter from '@/components/leads/LeadCenter'
import LeadDetail from '@/components/leads/LeadDetail'
import LeadStage from '@/components/leads/LeadStage'
import CourseDetails from '@/components/admin/CourseDetails'
import MockTest from '@/components/admin/MockTest'
import ExamRegistration from '@/components/admin/ExamRegistration'
import StudentList from '@/components/admin/StudentList'
import StudentApplicationsAdmin from '@/components/admin/StudentApplicationsAdmin'
import StudentDocumentsAdmin from '@/components/admin/StudentDocumentsAdmin'
import MilestoneManager from '@/components/admin/MilestoneManager'
import AppointmentsAdmin from '@/components/admin/AppointmentsAdmin'
import NewsManagement from '@/components/admin/NewsManagement'
import FollowUpPage from '@/components/dashboard/FollowUpPage'
import ProfilePage from '@/components/shared/ProfilePage'
import { getUserIdFromToken, getToken } from '@/lib/helpers/jwt'
import { getProfile } from '@/lib/api/auth'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { API_URL } from '@/lib/api/base'
import type { Page } from '@/types/navigation'

function formatRoleLabel(role: string): string {
  return role === 'bdm' ? 'BDM' : role
}

export default function BDMDashboardPage() {
  return <BDMDashboardContent />
}

function BDMDashboardContent() {
  const router = useRouter()
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [leadCenterRefreshKey, setLeadCenterRefreshKey] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const { unreadCount } = useNotifications()

  const clearAuthAndRedirect = async () => {
    const token = getToken()
    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })
      }
    } catch { /* best-effort server logout — local cleanup always runs */ }
    Cookies.remove('accessToken')
    Cookies.remove('studentToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('studentToken')
    router.replace('/login')
  }

  useEffect(() => {
    const decoded = getUserIdFromToken()

    if (!decoded) {
      clearAuthAndRedirect()
      return
    }

    if (decoded.role === 'admin') {
      router.replace('/admin/dashboard')
      return
    }
    if (decoded.role !== 'bdm') {
      clearAuthAndRedirect()
      return
    }

    const baseUser = {
      name: decoded.email?.split('@')[0] || 'User',
      email: decoded.email,
      role: formatRoleLabel(decoded.role || ''),
    }
    setUser(baseUser)
    setIsInitialized(true)

    const token = getToken()
    if (token) {
      getProfile(token)
        .then((profile: { name?: string }) => {
          if (profile?.name) {
            setUser((u: { name: string; email?: string; role: string } | null) =>
              u ? { ...u, name: profile.name as string } : u
            )
          }
        })
        .catch((err: any) => {
          if (err?.status === 401 || err?.status === 403) {
            clearAuthAndRedirect()
          }
        })
    }
  }, [router])

  const handleLogout = () => {
    clearAuthAndRedirect()
  }

  const handleNotificationClick = () => {
    setActivePage('notification')
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <BDMDashboard
            onViewLead={(id) => { setSelectedLeadId(id); setActivePage('lead-detail') }}
            onAddLead={() => setActivePage('lead-center')}
            onViewAllLeads={() => setActivePage('lead-center')}
            onBookExam={() => setActivePage('exam-reg')}
            onNewLeadsToday={() => setActivePage('lead-center')}
            onViewMockTests={() => setActivePage('mock-test')}
            userName={user?.name}
          />
        )
      case 'lead-center':
        return <LeadCenter refreshKey={leadCenterRefreshKey} onViewLead={(id) => { setSelectedLeadId(id); setActivePage('lead-detail'); }} />
      case 'lead-detail':
        return selectedLeadId
          ? <LeadDetail id={selectedLeadId} onBack={() => { setLeadCenterRefreshKey(k => k + 1); setActivePage('lead-center'); }} />
          : <LeadCenter refreshKey={leadCenterRefreshKey} onViewLead={(id) => { setSelectedLeadId(id); setActivePage('lead-detail'); }} />
      case 'lead-stage':
        return <LeadStage />
      case 'course-details':
        return <CourseDetails />
      case 'mock-test':
        return <MockTest />
      case 'exam-reg':
        return <ExamRegistration />
      case 'student-list':
        return <StudentList />
      case 'student-applications':
        return <StudentApplicationsAdmin />
      case 'student-documents':
        return <StudentDocumentsAdmin />
      case 'milestones':
        return <MilestoneManager />
      case 'appointments-admin':
        return <AppointmentsAdmin />
      case 'news-management':
        return <NewsManagement />
      case 'notification':
        return <FollowUpPage />
      case 'profile':
        return <ProfilePage />
      default:
        return (
          <BDMDashboard
            onViewLead={(id) => { setSelectedLeadId(id); setActivePage('lead-detail') }}
            onAddLead={() => setActivePage('lead-center')}
            onViewAllLeads={() => setActivePage('lead-center')}
            onBookExam={() => setActivePage('exam-reg')}
            onNewLeadsToday={() => setActivePage('lead-center')}
            onViewMockTests={() => setActivePage('mock-test')}
            userName={user?.name}
          />
        )
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-11 w-11 border-2 border-[#FACE39] border-t-[#00000F] mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#00000F]/70">Opening your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          user={user}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
        />
        <main className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6 lg:px-8 lg:py-7 scrollbar-hide bg-[#fafafa]">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
