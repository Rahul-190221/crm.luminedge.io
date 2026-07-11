'use client'

import { useState, useEffect } from 'react'
import { Search, UserX, Users, UserCheck, UserMinus, AlertCircle } from 'lucide-react'
import { getUsers, deleteUser } from '@/lib/api/auth'
import { BDM } from '@/types/admin'
import { getBdmColor } from '@/lib/helpers/bdmColors'

const getInitials = (name: string): string => {
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    : name.charAt(0).toUpperCase()
}

export default function BDMRemove() {
  const [bdmUsers, setBdmUsers] = useState<BDM[]>([])
  const [filteredUsers, setFilteredUsers] = useState<BDM[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedBDM, setSelectedBDM] = useState<BDM | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

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

  const handleRemoveClick = (bdm: BDM) => {
    setSelectedBDM(bdm)
    setShowConfirmModal(true)
  }

  const handleConfirmRemove = async () => {
    if (!selectedBDM) return

    setIsRemoving(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        await deleteUser(token, selectedBDM._id);
        setBdmUsers(prev => prev.filter(u => u._id !== selectedBDM._id));
        alert('BDM removed successfully!');
      }
    } catch (error: any) {
      console.error('Error removing BDM:', error)
      alert(error.message || 'Failed to remove BDM. Please try again.')
    } finally {
      setIsRemoving(false)
      setShowConfirmModal(false)
      setSelectedBDM(null)
    }
  }

  const getRoleLabel = (role: string): string => role === 'bdm' ? 'BDM' : role

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Stats calculation
  const totalBDMs = bdmUsers.length
  const activeBDMs = bdmUsers.filter(u => u.status === 'active').length
  const inactiveBDMs = bdmUsers.filter(u => u.status === 'inactive').length
  const removableBDMs = bdmUsers.filter(u => (u.activeLeads || 0) === 0).length

  return (
    <div className="space-y-4 pb-6">
      {/* Page Header */}
      <div className="-mx-6 -mt-6 mb-4 p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Remove BDM</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage and remove Business Development Managers from the system</p>
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
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden mb-4 sm:mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-blue-600">
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Email</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Role</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Active Leads</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Converted</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">Join Date</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Status</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
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
                      <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                        {getRoleLabel(bdm.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">{bdm.activeLeads || 0}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">{bdm.convertedLeads || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(bdm.joinDate || bdm.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bdm.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {bdm.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemoveClick(bdm)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5 mx-auto"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{totalBDMs}</p>
              <p className="text-xs text-gray-500">Total BDMs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{activeBDMs}</p>
              <p className="text-xs text-gray-500">Active BDMs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{inactiveBDMs}</p>
              <p className="text-xs text-gray-500">Inactive BDMs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#00000F]/85">{removableBDMs}</p>
              <p className="text-xs text-gray-500">Removable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedBDM && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove BDM</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove <strong>{selectedBDM.name || `${selectedBDM.firstName || ''} ${selectedBDM.lastName || ''}`}</strong> from the system?
              {(selectedBDM.activeLeads || 0) > 0 && (
                <span className="text-red-600"> This user has {selectedBDM.activeLeads} active leads that will need to be reassigned.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setSelectedBDM(null)
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {isRemoving ? 'Removing...' : 'Remove BDM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
