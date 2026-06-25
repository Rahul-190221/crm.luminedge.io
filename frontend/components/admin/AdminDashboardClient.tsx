'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Bell, Menu } from 'lucide-react'
import Dashboard from '@/components/dashboard/Dashboard'
import LeadCenter from '@/components/leads/LeadCenter'
import LeadStage from '@/components/leads/LeadStage'
import CourseDetails from '@/components/admin/CourseDetails'
import MockTest from '@/components/admin/MockTest'
import ExamRegistration from '@/components/admin/ExamRegistration'
import BDMAdd from '@/components/admin/BDMAdd'
import BDMRemove from '@/components/admin/BDMRemove'
import BDMRole from '@/components/admin/BDMRole'
import BDMActivity from '@/components/admin/BDMActivity'
import BDMReport from '@/components/admin/BDMReport'
import LeadAssignments from '@/components/admin/LeadAssignments'
import LeadDetail from '@/components/leads/LeadDetail'
import LeadEditRequests from '@/components/admin/LeadEditRequests'
import NotificationsPage from '@/components/shared/NotificationsPage'
import ProfilePage from '@/components/shared/ProfilePage'
import StudentList from '@/components/admin/StudentList'
import StudentApplicationsAdmin from '@/components/admin/StudentApplicationsAdmin'
import StudentDocumentsAdmin from '@/components/admin/StudentDocumentsAdmin'
import MilestoneManager from '@/components/admin/MilestoneManager'
import AppointmentsAdmin from '@/components/admin/AppointmentsAdmin'
import NewsManagement from '@/components/admin/NewsManagement'
import AdminReports from '@/components/admin/AdminReports'
import { getUserIdFromToken, getToken } from '@/lib/helpers/jwt'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useSocketTick } from '@/components/providers/SocketProvider'
import { getLeadEditRequests } from '@/lib/api/leadEditRequests'
import { API_URL } from '@/lib/api/base'
import type { Page } from '@/types/navigation'

export default function AdminDashboardClient() {
  const router = useRouter()
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [leadCenterRefreshKey, setLeadCenterRefreshKey] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { unreadCount } = useNotifications()
  const socketTick = useSocketTick()
  const [pendingEditCount, setPendingEditCount] = useState(0)

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
    } catch { /* best-effort server logout â€” local cleanup always runs */ }
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

    if (decoded.role !== 'admin') {
      if (decoded.role === 'bdm') router.replace('/bdm/dashboard')
      else if (decoded.role === 'student') router.replace('/student/dashboard')
      else clearAuthAndRedirect()
      return
    }

    const baseUser = {
      name: decoded.email?.split('@')[0] || 'Admin',
      email: decoded.email,
      role: 'Admin',
    }
    setUser(baseUser)
    setIsInitialized(true)

    const token = getToken()
    if (token) {
      import('@/lib/api/auth').then(({ getProfile }) =>
        getProfile(token)
          .then((profile: { name?: string; firstName?: string; lastName?: string }) => {
            const fullName =
              [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
              profile.name ||
              baseUser.name
            setUser((u: any) => u ? { ...u, name: fullName } : u)
          })
          .catch((err: any) => {
            if (err?.status === 401 || err?.status === 403) clearAuthAndRedirect()
          })
      )
    }
  }, [router])

  useEffect(() => {
    getLeadEditRequests('pending').then(r => setPendingEditCount(r.length)).catch(() => {})
  }, [socketTick])

  const handleLogout = () => { clearAuthAndRedirect() }

  const handleNotificationClick = () => {
    setActivePage('notification')
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
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
      case 'bdm-add':
        return <BDMAdd />
      case 'bdm-remove':
        return <BDMRemove />
      case 'bdm-role':
        return <BDMRole />
      case 'bdm-activity':
        return <BDMActivity />
      case 'bdm-report':
        return <BDMReport />
      case 'lead-assignments':
        return <LeadAssignments />
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
      case 'reports':
        return <AdminReports />
      case 'notification':
        return <NotificationsPage onNavigate={(page) => setActivePage(page as Page)} />
      case 'profile':
        return <ProfilePage />
      case 'edit-request':
        return <LeadEditRequests />
      default:
        return <Dashboard />
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
        pendingEditCount={pendingEditCount}
        user={user}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only top bar — desktop shows nothing here; page sticky headers serve as the header */}
        <div className="lg:hidden flex-none flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 z-30">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/assets/logo.png" alt="Luminedge" className="h-8 w-auto object-contain" />
          <div className="flex items-center gap-2">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[13px] font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto px-6 py-6 pb-12 scrollbar-hide bg-[#f9fafb]">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}



