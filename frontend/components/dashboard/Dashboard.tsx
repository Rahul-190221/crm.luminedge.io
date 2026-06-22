'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Target,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { getAdminDashboardAll } from '@/lib/api/dashboard'


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeBDMs:      { value: 0, change: 0 },
    todaysLead:      { value: 0, change: 0 },
    todaysConverted: { value: 0, change: 0 },
    followupPending: { value: 0, change: 0 }
  })
  const [recentActivity,    setRecentActivity]    = useState<any[]>([])
  const [topPerformers,     setTopPerformers]      = useState<any[]>([])
  const [stageDistribution, setStageDistribution] = useState<any[]>([])
  const [stageTrend,        setStageTrend]         = useState<any[]>([])
  const [sourceDistribution,setSourceDistribution] = useState<any[]>([])
  const [conversionTrend,   setConversionTrend]    = useState<any[]>([])
  const [coursePerformance, setCoursePerformance]  = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [fetchTick,  setFetchTick]  = useState(0)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const res = await getAdminDashboardAll()
        if (res?.success) {
          const d = res.data
          if (d.stats)             setStats(prev => ({ ...prev, ...d.stats }))
          if (d.recentActivity)    setRecentActivity(d.recentActivity)
          if (d.topPerformers)     setTopPerformers(d.topPerformers)
          if (d.stageDistribution) setStageDistribution(d.stageDistribution)
          if (d.stageTrend)        setStageTrend(d.stageTrend)
          if (d.sourceDistribution)setSourceDistribution(d.sourceDistribution)
          if (d.conversionTrend)   setConversionTrend(d.conversionTrend)
          if (d.coursePerformance) {
            setCoursePerformance(d.coursePerformance)
          } else {
            setCoursePerformance([
              { label: 'IELTS Premium',   count: 0, color: '#EF4444' },
              { label: 'IELTS Crash',     count: 0, color: '#F87171' },
              { label: 'IELTS Intense',   count: 0, color: '#DC2626' },
              { label: 'IELTS Elementary',count: 0, color: '#FCA5A5' },
              { label: 'IELTS Mock Test', count: 0, color: '#FF6B6B' },
              { label: 'Basic English',   count: 0, color: '#F97316' },
              { label: 'GRE Premium',     count: 0, color: '#22C55E' },
              { label: 'TOEFL Premium',   count: 0, color: '#3B82F6' },
              { label: 'PTE Premium',     count: 0, color: '#A855F7' },
            ])
          }
        }
      } catch (error: any) {
        console.error('Admin dashboard fetch error:', error?.message || error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [fetchTick])

  const formatTimeAgo = (date: Date | string) => {
    const now    = new Date()
    const then   = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins  = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffMins  < 1)  return 'Just now'
    if (diffMins  < 60) return `${diffMins}m ago`
    if (diffHours === 1)return '1 hour ago'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      success: 'bg-emerald-500',
      info:    'bg-blue-500',
      warning: 'bg-amber-400',
      error:   'bg-red-500'
    }
    return colors[type] || 'bg-gray-400'
  }

  const SOURCE_CHART_COLORS = [
    '#3B82F6',
    '#22C55E',
    '#FACE39',
    '#A855F7',
    '#F97316',
    '#0EA5E9',
    '#EC4899'
  ]

  const stageColors: Record<string, string> = {
    Intake:     'bg-blue-50   text-blue-700   border-blue-200/80',
    Processing: 'bg-amber-50  text-amber-700  border-amber-200/80',
    Hot:        'bg-orange-50 text-orange-700 border-orange-200/80',
    Converted:  'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Dead:       'bg-red-50    text-red-700    border-red-200/80'
  }

  const maxCourseCount = coursePerformance.length > 0
    ? Math.max(...coursePerformance.map(s => s.count))
    : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-[#FACE39] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#00000F]/45">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#00000F]/85 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 text-xs mt-0.5 font-normal">
            Welcome back — here's what's happening today.
          </p>
        </div>
        <button
          onClick={() => setFetchTick(t => t + 1)}
          className="group flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#00000F]/60 bg-white border border-[#00000F]/[0.08] rounded-xl hover:bg-[#FACE39]/5 hover:border-[#FACE39]/30 hover:text-[#00000F]/80 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active BDMs */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-emerald-500">+{stats.activeBDMs.change}</span>
          </div>
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1.5">Active BDMs</p>
          <p className="text-[28px] sm:text-[32px] font-bold text-[#00000F]/85 tracking-tight">{stats.activeBDMs.value}</p>
        </div>

        {/* Today Lead */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-50 p-2.5 rounded-xl">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <span className={`text-xs font-bold ${stats.todaysLead.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.todaysLead.change >= 0 ? '+' : ''}{stats.todaysLead.change}%
            </span>
          </div>
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1.5">Today's Leads</p>
          <p className="text-[28px] sm:text-[32px] font-bold text-[#00000F]/85 tracking-tight">{stats.todaysLead.value}</p>
        </div>

        {/* Total Converted */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-emerald-50 p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className={`text-xs font-bold ${stats.todaysConverted.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.todaysConverted.change >= 0 ? '+' : ''}{stats.todaysConverted.change}%
            </span>
          </div>
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1.5">Total Converted</p>
          <p className="text-[28px] sm:text-[32px] font-bold text-[#00000F]/85 tracking-tight">{stats.todaysConverted.value}</p>
        </div>

        {/* Follow Up */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-orange-50 p-2.5 rounded-xl">
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <span className={`text-xs font-bold ${stats.followupPending.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.followupPending.change >= 0 ? '+' : ''}{stats.followupPending.change}%
            </span>
          </div>
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1.5">Follow Up Pending</p>
          <p className="text-[28px] sm:text-[32px] font-bold text-[#00000F]/85 tracking-tight">{stats.followupPending.value}</p>
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] card-lift">
          <h3 className="text-sm font-semibold text-[#00000F]/80 mb-3">Recent Activity</h3>
          <div className="space-y-3.5">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-[#00000F]/40 py-4 text-center">No recent activity.</p>
            ) : recentActivity.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-[5px] shrink-0 ${getActivityColor(item.type)}`} />
                <div className="min-w-0">
                  <p className="text-[14px] leading-snug">
                    <span className="font-semibold text-[#00000F]/80">{item.user}</span>
                    <span className="text-gray-400 ml-1">{item.action}</span>
                  </p>
                  <p className="text-[12px] text-gray-300 mt-0.5">{formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] card-lift">
          <h3 className="text-sm font-semibold text-[#00000F]/80 mb-3">Top Performers</h3>
          <div className="space-y-2">
            {topPerformers.length === 0 ? (
              <p className="text-xs text-[#00000F]/40 py-4 text-center">No performers data yet.</p>
            ) : topPerformers.map((performer) => (
              <div key={performer.rank} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#fafafa] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FACE39]/15 flex items-center justify-center text-[#00000F]/80 font-black text-xs border border-[#FACE39]/25 flex-shrink-0">
                    {performer.rank}
                  </div>
                  <span className="text-[14px] font-medium text-[#00000F]/75">{performer.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-gray-400">{performer.convertedLeads}/{performer.totalLeads}</p>
                  <p className="text-[14px] font-semibold text-emerald-500">{performer.conversionRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Stage Distribution */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-[#FACE39]/10 rounded-xl">
            <BarChart3 className="w-4 h-4 text-[#00000F]/70" />
          </div>
          <h2 className="text-[14px] font-semibold text-[#00000F]/80">Lead Stage Distribution — This Month</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {stageDistribution.length === 0 ? (
            <div className="col-span-full py-10 text-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa]">
              <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">No stage data this month</p>
            </div>
          ) : stageDistribution.map((item) => (
            <div key={item.stage} className={`p-4 rounded-xl border text-center ${stageColors[item.stage] ?? stageColors.Intake}`}>
              <h4 className="text-xl font-bold tabular-nums">{item.count}</h4>
              <p className="text-[11px] font-medium mt-1.5 leading-tight uppercase tracking-wider opacity-70">
                {item.stage === 'Hot' ? 'Hot Leads' : item.stage === 'Dead' ? 'Dead Leads' : item.stage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Lead Stage Trend */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Lead Stage Trend</h3>
          </div>
          <div style={{ height: 220 }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stageTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.6} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} width={26} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Converted" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3.5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Hot"        stroke="#F97316" strokeWidth={2.5} dot={{ r: 3.5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Intake"     stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3.5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Processing" stroke="#A855F7" strokeWidth={2.5} dot={{ r: 3.5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-purple-50 rounded-xl">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Lead Source Distribution</h3>
          </div>
          <div style={{ height: 248 }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height={248}>
                <PieChart margin={{ top: 0, right: 8, bottom: 4, left: 8 }}>
                  <Pie
                    data={sourceDistribution}
                    cx="50%" cy="46%"
                    innerRadius={58} outerRadius={82}
                    paddingAngle={2}
                    dataKey="percentage" nameKey="source"
                    stroke="#fff" strokeWidth={1.5}
                  >
                    {sourceDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_CHART_COLORS[index % SOURCE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', fontWeight: 700 }} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" iconSize={7}
                    wrapperStyle={{ fontSize: '9px', fontWeight: 700, paddingTop: '6px', lineHeight: '1.4' }}
                    formatter={(value) => <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-[#FACE39]/10 rounded-xl">
              <TrendingUp className="w-4 h-4 text-[#00000F]/60" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Conversion Rate Trend</h3>
          </div>
          <div style={{ height: 220 }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={conversionTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.6} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} tickFormatter={v => `${v}%`} width={30} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 6 }} formatter={(value) => [`${value}%`, 'Rate']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                  />
                  <Bar dataKey="rate" fill="#FACE39" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Monthly Course Performance */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-[#FACE39]/10 rounded-xl">
              <Activity className="w-4 h-4 text-[#00000F]/60" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Monthly Course Performance</h3>
          </div>
          <div className="space-y-5">
            {coursePerformance.length > 0 ? coursePerformance.map((item) => (
              <div key={item.label} className="group space-y-2">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-[#00000F]/55 uppercase tracking-widest">{item.label}</span>
                    <span className="text-[12px] font-semibold text-[#00000F]/70 truncate">{item.label} enrollments</span>
                  </div>
                  <span className="text-xl font-bold text-[#00000F]/80 tabular-nums shrink-0">{item.count}</span>
                </div>
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden ring-1 ring-inset ring-gray-200/50">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                    style={{
                      width: `${maxCourseCount > 0 ? (item.count / maxCourseCount) * 100 : 0}%`,
                      minWidth: item.count > 0 ? 3 : 0,
                      backgroundColor: item.color || '#FACE39',
                      boxShadow: item.count > 0 ? `0 0 10px ${item.color || '#FACE39'}50` : undefined,
                      opacity: item.count > 0 ? 1 : 0.2
                    }}
                  />
                </div>
              </div>
            )) : (
              <div className="py-10 text-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa]">
                <p className="text-sm font-semibold text-gray-500">No course metrics yet</p>
                <p className="text-xs text-gray-400 mt-1 px-4">Course counts update as leads are tied to programs.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
