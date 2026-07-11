'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, Users, ChevronRight, Edit2, Check, X } from 'lucide-react'
import { getUsers, updateUserRole } from '@/lib/api/auth'
import { BDM } from '@/types/admin'
import { getBdmColor } from '@/lib/helpers/bdmColors'

const getInitials = (name?: string): string => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    : name.charAt(0).toUpperCase()
}

export default function BDMRole() {
  const [bdmUsers, setBdmUsers] = useState<BDM[]>([])
  const [filteredUsers, setFilteredUsers] = useState<BDM[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchBDMUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, filterRole, bdmUsers])

  const fetchBDMUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const data = await getUsers(token, 'bdm');
        setBdmUsers(data);
      }
    } catch (error) {
      console.error('Error fetching BDM users:', error);
      setBdmUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...bdmUsers]

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole)
    }

    setFilteredUsers(filtered)
  }

  const handleEditClick = (bdm: BDM) => {
    setEditingUserId(bdm._id)
    setEditRole(bdm.role)
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditRole('')
  }

  const handleSaveRole = async (bdmId: string) => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        await updateUserRole(token, bdmId, editRole);
        setBdmUsers(prev => prev.map(u =>
          u._id === bdmId ? { ...u, role: editRole } : u
        ))
        alert('Role updated successfully!')
      }
    } catch (error: any) {
      console.error('Error updating role:', error)
      alert(error.message || 'Failed to update role. Please try again.')
    } finally {
      setIsSaving(false)
      setEditingUserId(null)
      setEditRole('')
    }
  }

  const getRoleLabel = (role: string): string => role === 'bdm' ? 'BDM' : role

  const getRoleBadgeColor = (_role: string): string => 'bg-blue-100 text-blue-700'

  const bdmCount = bdmUsers.filter(u => u.role === 'bdm').length
  const seniorCount = bdmUsers.filter(u => (u.role as string) === 'senior_bdm').length
  const juniorCount = bdmUsers.filter(u => (u.role as string) === 'junior_bdm').length
  const totalCount = bdmUsers.length

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">BDM Role Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage roles and hierarchy for Business Development Managers</p>
      </div>

      {/* Role Stats Card */}
      <div className="bg-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">BDM Overview</h2>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">BDM</p>
              <p className="text-xs text-gray-500">{bdmCount} of {totalCount} users</p>
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            title="Filter by role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
          >
            <option value="all">All Roles</option>
            <option value="bdm">BDM</option>
          </select>
        </div>
      </div>

      {/* BDM Table */}
      <div className="bg-white rounded-xl overflow-hidden mb-4 sm:mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-blue-600">
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Email</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Current Role</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Reporting To</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Active Leads</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No BDM users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((bdm, index) => (
                  <tr key={bdm._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{ backgroundColor: getBdmColor(bdm.name || bdm.firstName || '').bg, color: getBdmColor(bdm.name || bdm.firstName || '').text }}
                        >
                          {getInitials(bdm.name || `${bdm.firstName || ''} ${bdm.lastName || ''}`)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{bdm.name || `${bdm.firstName || ''} ${bdm.lastName || ''}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{bdm.email}</td>
                    <td className="px-4 py-3">
                      {editingUserId === bdm._id ? (
                        <select
                          title="Change role"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
                        >
                          <option value="bdm">BDM</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(bdm.role)}`}>
                          {getRoleLabel(bdm.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{bdm.reportingToName || 'N/A'}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">{bdm.activeLeads || 0}</td>
                    <td className="px-4 py-3 text-center">
                      {editingUserId === bdm._id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Save"
                            onClick={() => handleSaveRole(bdm._id)}
                            disabled={isSaving}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            title="Cancel"
                            onClick={handleCancelEdit}
                            className="p-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(bdm)}
                          className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5 mx-auto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Change Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Distribution Stats */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-purple-600">{seniorCount}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Senior BDM</p>
            <p className="text-xs text-gray-500">{totalCount > 0 ? Math.round((seniorCount / totalCount) * 100) : 0}% of team</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{bdmCount}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">BDM</p>
            <p className="text-xs text-gray-500">{totalCount > 0 ? Math.round((bdmCount / totalCount) * 100) : 0}% of team</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{juniorCount}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Junior BDM</p>
            <p className="text-xs text-gray-500">{totalCount > 0 ? Math.round((juniorCount / totalCount) * 100) : 0}% of team</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-gray-600">{totalCount}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Total</p>
            <p className="text-xs text-gray-500">All BDMs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
