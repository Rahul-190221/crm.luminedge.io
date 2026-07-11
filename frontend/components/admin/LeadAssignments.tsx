'use client'

import { useState, useEffect } from 'react'
import { Search, Send, Users, UserPlus, Clock, CheckCircle } from 'lucide-react'
import { getLeads, getBDMsForAssignment, assignLeads } from '@/lib/api/leads'
import { getSourceColor } from '@/lib/constants/leadSourceColors'
import { getBdmColor } from '@/lib/helpers/bdmColors'

import { Lead, BDM } from '@/types/admin'

// Avatar color generator based on name
const getAvatarColor = (name?: string): string => {
  const colors = [
    'bg-sky-400',
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

export default function LeadAssignments() {
  const [unassignedLeads, setUnassignedLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [bdmUsers, setBdmUsers] = useState<BDM[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedBDM, setSelectedBDM] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    fetchUnassignedLeads()
    fetchBDMUsers()
  }, [])

  useEffect(() => {
    filterLeadsData()
  }, [searchTerm, filterCourse, unassignedLeads])

  const fetchUnassignedLeads = async () => {
    setIsLoading(true);
    try {
      const data = await getLeads({ unassigned: true, limit: 500 });
      setUnassignedLeads(data.leads);
    } catch (error) {
      console.error('Error fetching unassigned leads:', error);
      setUnassignedLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBDMUsers = async () => {
    try {
      const data = await getBDMsForAssignment();
      setBdmUsers(data as any);
    } catch (error) {
      console.error('Error fetching BDM users:', error)
      setBdmUsers([])
    }
  }

  const filterLeadsData = () => {
    let filtered = [...unassignedLeads]

    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone?.includes(searchTerm)
      )
    }

    if (filterCourse !== 'all') {
      filtered = filtered.filter(l => l.serviceInterest?.includes(filterCourse as any))
    }

    setFilteredLeads(filtered)
  }

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(l => l._id))
    }
  }

  const handleAssignLeads = async () => {
    if (!selectedBDM || selectedLeads.length === 0) {
      alert('Please select a BDM and at least one lead')
      return
    }

    setIsAssigning(true)
    try {
      await assignLeads(selectedLeads, selectedBDM);
      alert(`Successfully assigned ${selectedLeads.length} lead(s)!`);
      setUnassignedLeads(prev => prev.filter(l => !selectedLeads.includes(l._id)));
      setSelectedLeads([]);
      setSelectedBDM('');
      setShowAssignModal(false);
    } catch (error: any) {
      console.error('Error assigning leads:', error)
      alert(error.message || 'Failed to assign leads. Please try again.')
    } finally {
      setIsAssigning(false)
    }
  }

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getRoleLabel = (role: string): string => role === 'bdm' ? 'BDM' : role

  const getCourseColor = (course: string): string => {
    const colors: Record<string, string> = {
      'IELTS': 'bg-blue-100 text-blue-700',
      'PTE': 'bg-purple-100 text-purple-700',
      'GRE': 'bg-green-100 text-green-700',
      'TOEFL': 'bg-orange-100 text-orange-700'
    }
    return colors[course] || 'bg-gray-100 text-gray-700'
  }

  // Stats
  const totalUnassigned = unassignedLeads.length
  const todayLeads = unassignedLeads.filter(l => {
    const leadDate = new Date(l.createdAt).toDateString()
    const today = new Date().toDateString()
    return leadDate === today
  }).length
  const pendingHours = unassignedLeads.filter(l => {
    const diffHours = (Date.now() - new Date(l.createdAt).getTime()) / 3600000
    return diffHours > 2
  }).length

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Assign unassigned leads to BDMs</p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          disabled={selectedLeads.length === 0}
          className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>Assign Selected ({selectedLeads.length})</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUnassigned}</p>
              <p className="text-xs text-gray-500">Unassigned Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayLeads}</p>
              <p className="text-xs text-gray-500">New Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingHours}</p>
              <p className="text-xs text-gray-500">Pending &gt; 2 Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent"
            />
          </div>

          {/* Course Filter */}
          <select
            title="Filter by course"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
          >
            <option value="all">All Courses</option>
            <option value="IELTS">IELTS</option>
            <option value="PTE">PTE</option>
            <option value="GRE">GRE</option>
            <option value="TOEFL">TOEFL</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-blue-600">
                <th className="text-left px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all leads"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white text-blue-600 focus:ring-blue-400/40"
                  />
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Lead Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Email</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Course</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Source</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Created</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p>All leads have been assigned!</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => (
                  <tr key={lead._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        title="Select lead"
                        aria-label="Select lead"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => handleSelectLead(lead._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400/40"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(lead.fullName)}`}>
                          {getInitials(lead.fullName)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{lead.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCourseColor(lead.serviceInterest?.[0] ?? '')}`}>
                        {lead.serviceInterest?.join(', ') || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: getSourceColor(lead.source).bg, color: getSourceColor(lead.source).text }}
                      >
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatTime(lead.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLeads([lead._id])
                          setShowAssignModal(true)
                        }}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assign Leads</h3>
                <p className="text-sm text-gray-500">Assign {selectedLeads.length} lead(s) to a BDM</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select BDM</label>
              <select
                title="Select BDM"
                value={selectedBDM}
                onChange={(e) => setSelectedBDM(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
              >
                <option value="">Choose a BDM...</option>
                {bdmUsers.map(bdm => (
                  <option key={bdm._id} value={bdm._id}>
                    {bdm.name || `${bdm.firstName || ''} ${bdm.lastName || ''}`} - {getRoleLabel(bdm.role)} ({bdm.activeLeads || 0} active)
                  </option>
                ))}
              </select>
            </div>

            {/* BDM Cards Preview */}
            <div className="mb-6 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">BDM Workload</p>
              <div className="space-y-2">
                {bdmUsers.map(bdm => (
                  <div
                    key={bdm._id}
                    onClick={() => setSelectedBDM(bdm._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedBDM === bdm._id
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ backgroundColor: getBdmColor(bdm.name || bdm.firstName || '').bg, color: getBdmColor(bdm.name || bdm.firstName || '').text }}
                        >
                          {getInitials(bdm.name || `${bdm.firstName || ''} ${bdm.lastName || ''}`)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{bdm.name || `${bdm.firstName || ''} ${bdm.lastName || ''}`}</p>
                          <p className="text-xs text-gray-500">{getRoleLabel(bdm.role)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{bdm.activeLeads || 0}</p>
                        <p className="text-xs text-gray-500">active leads</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBDM('')
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignLeads}
                disabled={isAssigning || !selectedBDM}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {isAssigning ? 'Assigning...' : 'Assign Leads'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
