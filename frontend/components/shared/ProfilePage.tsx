'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Phone, Briefcase, Calendar, Save, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProfile, updateProfile, changePassword, getUserStats } from '@/lib/api/auth'

interface UserProfile {
    firstName: string
    lastName: string
    email: string
    phone: string
    department: string
    role: string
    joinDate: string
    avatar?: string
}

interface UserStats {
    totalLeads: number
    converted: number
    conversionRate: string
}

const inputClass = 'w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#00000F]/[0.09] rounded-xl text-sm font-medium text-[#00000F]/80 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] transition-all duration-200'
const readonlyClass = 'w-full px-3.5 py-2.5 bg-[#00000F]/[0.03] border border-[#00000F]/[0.06] rounded-xl text-sm font-medium text-[#00000F]/35 cursor-not-allowed'
const labelClass = 'block text-[12px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-1.5'

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile>({
        firstName: '', lastName: '', email: '', phone: '', department: '', role: '', joinDate: ''
    })
    const [stats, setStats] = useState<UserStats>({ totalLeads: 0, converted: 0, conversionRate: '0%' })
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [saving, setSaving] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                if (!token) return
                const [profileData, statsData] = await Promise.all([getProfile(token), getUserStats(token)])
                setProfile({
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    email: profileData.email || '',
                    phone: profileData.phone || '',
                    department: profileData.department || '',
                    role: profileData.role || '',
                    joinDate: new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    avatar: profileData.avatarUrl
                })
                if (statsData.success) setStats(statsData.data)
            } catch {
                toast.error('Failed to load profile data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleUpdateProfile = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return
            const { firstName, lastName, phone, department } = profile
            await updateProfile(token, { firstName, lastName, phone, department })
            toast.success('Profile updated successfully')
        } catch (error: unknown) {
            toast.error((error as { message?: string }).message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        setPasswordLoading(true)
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return
            await changePassword(token, { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
            toast.success('Password changed successfully')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error: unknown) {
            toast.error((error as { message?: string }).message || 'Failed to change password')
        } finally {
            setPasswordLoading(false)
        }
    }

    const displayName = profile.firstName || profile.lastName
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : profile.email?.split('@')[0] || 'User'

    const avatarInitial = (profile.firstName?.[0] || profile.email?.[0] || 'U').toUpperCase()

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto flex items-center justify-center h-80">
                <div className="w-9 h-9 border-4 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-4 pb-6">

            {/* Page header */}
            <div className="-mx-6 -mt-6 mb-4 p-4 md:p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your personal information and settings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left column ── */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Identity card */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] overflow-hidden">
                        {/* Yellow banner */}
                        <div className="h-16 bg-[#1a56db]/10 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a56db]" />
                        </div>

                        <div className="px-5 pb-5">
                            {/* Avatar + role badge */}
                            <div className="-mt-9 mb-3.5 flex items-end justify-between">
                                <div className="w-[68px] h-[68px] rounded-2xl border-[3px] border-white shadow-[0_4px_14px_rgba(0,0,0,0.13)] bg-[#1a56db] flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                                    {profile.avatar
                                        ? <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        : avatarInitial}
                                </div>
                                <span className="mb-0.5 text-[11px] font-bold uppercase tracking-widest bg-[#ebf0ff] text-[#1a56db] px-2.5 py-1 rounded-full border border-[#1a56db]/20">
                                    {profile.role.replace(/-/g, ' ') || 'User'}
                                </span>
                            </div>

                            <h2 className="text-[15px] font-bold text-[#00000F]/85 tracking-tight leading-tight mb-0.5">{displayName}</h2>
                            <p className="text-[13px] text-[#00000F]/40 font-medium truncate mb-4">{profile.email}</p>

                            <div className="space-y-2.5 pt-4 border-t border-[#00000F]/[0.05]">
                                {[
                                    { Icon: Mail, value: profile.email, always: true },
                                    { Icon: Phone, value: profile.phone, always: false },
                                    { Icon: Briefcase, value: profile.department, always: false },
                                    { Icon: Calendar, value: profile.joinDate ? `Joined ${profile.joinDate}` : null, always: true },
                                ].map(({ Icon, value, always }, i) =>
                                    (always || value) ? (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <span className="w-7 h-7 rounded-lg bg-[#ebf0ff] border border-[#1a56db]/20 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-3.5 h-3.5 text-[#1a56db]" />
                                            </span>
                                            <span className="text-xs font-medium text-[#00000F]/60 truncate">{value || '—'}</span>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Performance stats */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="w-[3px] h-4 bg-[#1a56db] rounded-full" />
                            <h3 className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">Performance</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                            <div className="bg-[#00000F]/[0.04] border border-[#00000F]/[0.08] rounded-xl p-3.5 text-center">
                                <p className="text-[26px] font-extrabold text-[#00000F] tabular-nums leading-none">{stats.totalLeads}</p>
                                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase tracking-widest mt-1.5">Total Leads</p>
                            </div>
                            <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl p-3.5 text-center">
                                <p className="text-[26px] font-extrabold text-[#16A34A] tabular-nums leading-none">{stats.converted}</p>
                                <p className="text-[10px] font-bold text-[#16A34A]/60 uppercase tracking-widest mt-1.5">Converted</p>
                            </div>
                        </div>
                        <div className="bg-[#ebf0ff] border border-[#1a56db]/25 rounded-xl px-4 py-3.5 flex items-center justify-between">
                            <p className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">Conversion Rate</p>
                            <p className="text-[20px] font-extrabold text-[#00000F] tabular-nums">{stats.conversionRate}</p>
                        </div>
                    </div>
                </div>

                {/* ── Right column ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Edit profile form */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5 sm:p-6">
                        <div className="flex items-center gap-2.5 mb-5">
                            <span className="w-[3px] h-5 bg-[#1a56db] rounded-full" />
                            <h3 className="text-[14px] font-bold text-[#00000F] tracking-tight">Edit Profile Information</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input type="text" value={profile.firstName}
                                    onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                    placeholder="First name"
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input type="text" value={profile.lastName}
                                    onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                    placeholder="Last name"
                                    className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Email Address</label>
                                <input type="email" value={profile.email} readOnly className={readonlyClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input type="text" value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+1 (234) 567-8900"
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Department</label>
                                <input type="text" value={profile.department}
                                    onChange={e => setProfile({ ...profile, department: e.target.value })}
                                    placeholder="e.g. Sales"
                                    className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Role</label>
                                <input type="text" value={profile.role} readOnly className={readonlyClass} />
                            </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-[#00000F]/[0.05]">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={saving}
                                className="flex items-center gap-2 h-10 px-6 bg-[#1a56db] hover:bg-[#1341a8] text-white text-[13px] font-bold rounded-xl transition-all shadow-[0_2px_12px_rgba(26,86,219,0.30)] hover:shadow-[0_6px_20px_rgba(26,86,219,0.45)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Change password */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5 sm:p-6">
                        <div className="flex items-center gap-2.5 mb-5">
                            <span className="w-[3px] h-5 bg-[#1a56db] rounded-full" />
                            <h3 className="text-[14px] font-bold text-[#00000F] tracking-tight">Change Password</h3>
                        </div>

                        <div className="space-y-3.5">
                            {([
                                { field: 'currentPassword', label: 'Current Password', key: 'current' },
                                { field: 'newPassword', label: 'New Password', key: 'new' },
                                { field: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' },
                            ] as const).map(({ field, label, key }) => (
                                <div key={field}>
                                    <label className={labelClass}>{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords[key] ? 'text' : 'password'}
                                            value={passwordData[field]}
                                            onChange={e => setPasswordData({ ...passwordData, [field]: e.target.value })}
                                            placeholder="••••••••"
                                            className={`${inputClass} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPasswords[key]
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 pt-5 border-t border-[#00000F]/[0.05] flex justify-end">
                            <button
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#1a56db] hover:bg-[#1341a8] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-[0_6px_20px_rgba(26,86,219,0.30)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Lock className="w-4 h-4" />
                                {passwordLoading ? 'Updating…' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
