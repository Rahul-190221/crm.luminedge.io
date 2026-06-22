'use client'

import { useState, useEffect } from 'react'
import { Search, Activity, Clock, Phone, Mail, FileText, UserPlus, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { getActivities } from '@/lib/api/activities'

interface ActivityLog {
  _id: string
  userId: string
  userName: string
  userRole: string
  action: string
  actionType: 'call' | 'email' | 'lead_created' | 'lead_converted' | 'lead_lost' | 'note_added' | 'meeting' | 'follow_up'
  description: string
  leadName?: string
  timestamp: string
}

// Avatar color generator based on name
const getAvatarColor = (name?: string): string => {
  const colors = [
    'bg-[#FACE39]',
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500'
  ]
  if (!name) return colors[0]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const getInitials = (name?: string): string => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    : name.charAt(0).toUpperCase()
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'call': return <Phone className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    case 'lead_created': return <UserPlus className="w-4 h-4" />
    case 'lead_converted': return <CheckCircle className="w-4 h-4" />
    case 'lead_lost': return <XCircle className="w-4 h-4" />
    case 'note_added': return <FileText className="w-4 h-4" />
    case 'meeting': return <Calendar className="w-4 h-4" />
    case 'follow_up': return <Clock className="w-4 h-4" />
    default: return <Activity className="w-4 h-4" />
  }
}

const getActionColor = (actionType: string): string => {
  switch (actionType) {
    case 'call': return 'bg-blue-100 text-blue-600'
    case 'email': return 'bg-purple-100 text-purple-600'
    case 'lead_created': return 'bg-green-100 text-green-600'
    case 'lead_converted': return 'bg-emerald-100 text-emerald-600'
    case 'lead_lost': return 'bg-red-100 text-red-600'
    case 'note_added': return 'bg-yellow-100 text-yellow-600'
    case 'meeting': return 'bg-indigo-100 text-indigo-600'
    case 'follow_up': return 'bg-orange-100 text-orange-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getActionLabel = (actionType: string): string => {
  const labels: Record<string, string> = {
    'call': 'Phone Call',
    'email': 'Email Sent',
    'lead_created': 'Lead Created',
    'lead_converted': 'Lead Converted',
    'lead_lost': 'Lead Lost',
    'note_added': 'Note Added',
    'meeting': 'Meeting',
    'follow_up': 'Follow Up'
  }
  return labels[actionType] || actionType
}

export default function BDMActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    filterActivitiesData()
  }, [searchTerm, filterType, filterDate, activities])

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const data = await getActivities(token);
        setActivities(Array.isArray(data) ? data : (data.activities ?? []));
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterActivitiesData = () => {
    let filtered = [...activities]

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.actionType === filterType)
    }

    if (filterDate) {
      const selectedDate = new Date(filterDate).toDateString()
      filtered = filtered.filter(a => new Date(a.timestamp).toDateString() === selectedDate)
    }

    setFilteredActivities(filtered)
  }

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatFullTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleLabel = (role: string): string => role === 'bdm' ? 'BDM' : role

  // Stats calculation
  const todayActivities = activities.filter(a => {
    const actDate = new Date(a.timestamp).toDateString()
    const today = new Date().toDateString()
    return actDate === today
  }).length

  const callsToday = activities.filter(a => {
    const actDate = new Date(a.timestamp).toDateString()
    const today = new Date().toDateString()
    return actDate === today && a.actionType === 'call'
  }).length

  const emailsToday = activities.filter(a => {
    const actDate = new Date(a.timestamp).toDateString()
    const today = new Date().toDateString()
    return actDate === today && a.actionType === 'email'
  }).length

  const conversionsToday = activities.filter(a => {
    const actDate = new Date(a.timestamp).toDateString()
    const today = new Date().toDateString()
    return actDate === today && a.actionType === 'lead_converted'
  }).length

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-[#00000F]/85">BDM Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">Track all BDM activities and interactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{todayActivities}</p>
              <p className="text-xs text-gray-500">Today's Activities</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{callsToday}</p>
              <p className="text-xs text-gray-500">Calls Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{emailsToday}</p>
              <p className="text-xs text-gray-500">Emails Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{conversionsToday}</p>
              <p className="text-xs text-gray-500">Conversions Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
            />
          </div>

          {/* Activity Type Filter */}
          <select
            title="Filter by activity type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent bg-white"
          >
            <option value="all">All Activities</option>
            <option value="call">Phone Calls</option>
            <option value="email">Emails</option>
            <option value="lead_created">Lead Created</option>
            <option value="lead_converted">Conversions</option>
            <option value="lead_lost">Lost Leads</option>
            <option value="note_added">Notes</option>
            <option value="meeting">Meetings</option>
            <option value="follow_up">Follow Ups</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            title="Filter by date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
          />
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-[#FACE39]">
                <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">BDM</th>
                <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">Type</th>
                <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">Description</th>
                <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">Lead</th>
                <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACE39]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No activities found
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity, index) => (
                  <tr key={activity._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(activity.userName)}`}>
                          {getInitials(activity.userName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                          <p className="text-xs text-gray-500">{getRoleLabel(activity.userRole)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(activity.actionType)}`}>
                          {getActionIcon(activity.actionType)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{getActionLabel(activity.actionType)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{activity.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{activity.leadName || '-'}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatTime(activity.timestamp)}</p>
                        <p className="text-xs text-gray-500">{formatFullTime(activity.timestamp)}</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
