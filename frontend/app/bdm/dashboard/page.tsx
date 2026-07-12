'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import BDMSidebar from '@/components/layout/BDMSidebar'
import BDMMobileBar from '@/components/layout/BDMMobileBar'
import BDMDashboard from '@/components/dashboard/BDMDashboard'
import BDMPipeline from '@/components/dashboard/BDMPipeline'
import BDMExamSlots from '@/components/dashboard/BDMExamSlots'
import BDMReports from '@/components/dashboard/BDMReports'
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
import { API_URL } from '@/lib/api/base'
import { useFollowUpLeads } from '@/lib/hooks/useFollowUpLeads'
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
  const [leadDetailReturnTo, setLeadDetailReturnTo] = useState<Page>('lead-center')
  const [leadCenterRefreshKey, setLeadCenterRefreshKey] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Same shared query/hook as the Follow-up Reminders page and the dashboard widget, so the
  // sidebar badge always agrees with what those two surfaces show (Today + Overdue count).
  const currentUserId = useMemo(() => {
    const decoded = getUserIdFromToken()
    return decoded?.id || decoded?.userId || null
  }, [])
  const { rows: followUpRows } = useFollowUpLeads(currentUserId)
  // Leads marked "Done" on the Follow-up Reminders page, tracked here so the sidebar badge
  // drops immediately instead of waiting for this hook's own next refetch.
  const [doneFollowUpIds, setDoneFollowUpIds] = useState<Set<string>>(new Set())
  const followUpCount = followUpRows.filter(r => r.dueStatus !== 'upcoming' && !doneFollowUpIds.has(r.id)).length

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
    } catch {
      /* best-effort server logout - local cleanup always runs */
    }

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


  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <BDMDashboard
            onViewLead={(id) => { setSelectedLeadId(id); setLeadDetailReturnTo('lead-center'); setActivePage('lead-detail') }}
            onAddLead={() => setActivePage('lead-center')}
            onViewAllLeads={() => setActivePage('lead-center')}
            onBookExam={() => setActivePage('bdm-exam-slots')}
            onNewLeadsToday={() => setActivePage('bdm-pipeline')}
            onViewMockTests={() => setActivePage('mock-test')}
            userName={user?.name}
            setActivePage={setActivePage}
          />
        )
      case 'bdm-pipeline':
        return <BDMPipeline setActivePage={setActivePage} onViewLead={(id) => { setSelectedLeadId(id); setLeadDetailReturnTo('bdm-pipeline'); setActivePage('lead-detail') }} />
      case 'lead-center':
        return <LeadCenter refreshKey={leadCenterRefreshKey} onViewLead={(id) => { setSelectedLeadId(id); setLeadDetailReturnTo('lead-center'); setActivePage('lead-detail') }} />
      case 'lead-detail':
        return selectedLeadId
          ? <LeadDetail id={selectedLeadId} onBack={() => { setLeadCenterRefreshKey(k => k + 1); setActivePage(leadDetailReturnTo); }} />
          : <LeadCenter refreshKey={leadCenterRefreshKey} onViewLead={(id) => { setSelectedLeadId(id); setLeadDetailReturnTo('lead-center'); setActivePage('lead-detail'); }} />
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
      case 'bdm-exam-slots':
        return <BDMExamSlots />
      case 'bdm-reports':
        return <BDMReports />
      case 'notification':
        return (
          <FollowUpPage
            onMarkDone={(id) => setDoneFollowUpIds(prev => new Set(prev).add(id))}
            onUndoMarkDone={(id) => setDoneFollowUpIds(prev => { const s = new Set(prev); s.delete(id); return s })}
          />
        )
      case 'profile':
        return <ProfilePage />
      default:
        return (
          <BDMDashboard
            onViewLead={(id) => { setSelectedLeadId(id); setActivePage('lead-detail') }}
            onAddLead={() => setActivePage('lead-center')}
            onViewAllLeads={() => setActivePage('lead-center')}
            onBookExam={() => setActivePage('bdm-exam-slots')}
            onNewLeadsToday={() => setActivePage('bdm-pipeline')}
            onViewMockTests={() => setActivePage('mock-test')}
            userName={user?.name}
            setActivePage={setActivePage}
          />
        )
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-11 w-11 border-2 border-[#1a56db] border-t-[#00000f] mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#00000f]/70">Opening your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
      <BDMSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={followUpCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <BDMMobileBar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#f9fafb] pt-3 lg:pt-6 pr-6 pb-12 pl-4 scrollbar-hide">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}


