'use client'

import { useCallback, useEffect, useState } from 'react'
import { getFollowUpLeads, type FollowUpLead } from '@/lib/api/leads'
import { useSocket } from '@/components/providers/SocketProvider'

export type FollowUpDueStatus = 'overdue' | 'today' | 'upcoming'

export type FollowUpRow = {
  id: string
  name: string
  phone: string
  courseInterest: string
  dueDate: string
  dueStatus: FollowUpDueStatus
  note: string
}

export function mapLeadToFollowUpRow(lead: FollowUpLead): FollowUpRow {
  const svc = Array.isArray(lead.serviceInterest) ? lead.serviceInterest[0] : undefined
  return {
    id: lead._id,
    name: lead.fullName || 'Unnamed lead',
    phone: lead.phone,
    courseInterest: svc || 'Unknown',
    dueDate: lead.lastFollowUp?.nextFollowUpDate || '',
    dueStatus: lead.dueStatus,
    note: lead.lastFollowUp?.note || '',
  }
}

// Single shared fetch used by the Follow-up Reminders page, the dashboard's "Today's
// Follow-ups" widget, and the sidebar badge count, so all three always agree.
export function useFollowUpLeads(assignedTo?: string | null) {
  const socket = useSocket()
  const [rows, setRows] = useState<FollowUpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFollowUpLeads(assignedTo ? { assignedTo } : undefined)
      setRows((Array.isArray(data.leads) ? data.leads : []).map(mapLeadToFollowUpRow))
    } catch (err: any) {
      setError(err?.message || 'Could not load follow-ups.')
    } finally {
      setLoading(false)
    }
  }, [assignedTo])

  useEffect(() => { refetch() }, [refetch])

  // The follow-up cron (9am/1pm/5pm Asia/Dhaka) emits 'new-notification' when it fires, same
  // event any follow-up add/edit already triggers — refetch on it so all three surfaces stay in sync.
  useEffect(() => {
    const rawSocket = socket?.socket
    if (!rawSocket) return
    const handler = () => refetch()
    rawSocket.on('new-notification', handler)
    return () => { rawSocket.off('new-notification', handler) }
  }, [socket, refetch])

  return { rows, loading, error, refetch }
}
