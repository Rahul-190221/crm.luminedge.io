'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  Target,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Clock
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
  const [recentActivity,     setRecentActivity]     = useState<any[]>([])
  const [topPerformers,      setTopPerformers]       = useState<any[]>([])
  const [stageDistribution,  setStageDistribution]  = useState<any[]>([])
  const [stageTrend,         setStageTrend]          = useState<any[]>([])
  const [sourceDistribution, setSourceDistribution] = useState<any[]>([])
  const [conversionTrend,    setConversionTrend]    = useState<any[]>([])
  const [coursePerformance,  setCoursePerformance]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [fetchTick, setFetchTick] = useState(0)
  const [mounted,   setMounted]   = useState(false)
  const [error,     setError]     = useState<Error | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getAdminDashboardAll()
        if (!res?.success) throw new Error(res?.message || 'Could not load dashboard.')
        const d = res.data
        if (d.stats)             setStats(prev => ({ ...prev, ...d.stats }))
        if (d.recentActivity)    setRecentActivity(d.recentActivity)
        if (d.topPerformers)     setTopPerformers(d.topPerformers)
        if (d.stageDistribution) setStageDistribution(d.stageDistribution)
        if (d.stageTrend)        setStageTrend(d.stageTrend)
        if (d.sourceDistribution) setSourceDistribution(d.sourceDistribution)
        if (d.conversionTrend)   setConversionTrend(d.conversionTrend)
        if (d.coursePerformance) {
          setCoursePerformance(d.coursePerformance)
        } else {
          setCoursePerformance([
            { label: 'IELTS Reg',        count: 0, color: '#64748B' },
            { label: 'PTE Reg',          count: 0, color: '#64748B' },
            { label: 'TOEFL Reg',        count: 0, color: '#64748B' },
            { label: 'GRE Reg',          count: 0, color: '#64748B' },
            { label: 'Duolingo Reg',     count: 0, color: '#64748B' },
            { label: 'IELTS Premium',    count: 0, color: '#EF4444' },
            { label: 'IELTS Crash',      count: 0, color: '#F87171' },
            { label: 'IELTS Intense',    count: 0, color: '#DC2626' },
            { label: 'IELTS 1 Module',   count: 0, color: '#FCA5A5' },
            { label: 'IELTS 1-on-1',     count: 0, color: '#FF6B6B' },
            { label: 'IELTS Mock Tests', count: 0, color: '#B91C1C' },
            { label: 'PTE Premium',      count: 0, color: '#A855F7' },
            { label: 'PTE Crash',        count: 0, color: '#C084FC' },
            { label: 'PTE Intense',      count: 0, color: '#9333EA' },
            { label: 'PTE 1 Module',     count: 0, color: '#D8B4FE' },
            { label: 'PTE 1-on-1',       count: 0, color: '#7E22CE' },
            { label: 'PTE Mock Tests',   count: 0, color: '#6B21A8' },
            { label: 'TOEFL Premium',    count: 0, color: '#3B82F6' },
            { label: 'TOEFL Crash',      count: 0, color: '#60A5FA' },
            { label: 'TOEFL 1 Module',   count: 0, color: '#2563EB' },
            { label: 'TOEFL 1-on-1',     count: 0, color: '#93C5FD' },
            { label: 'TOEFL Mock Tests', count: 0, color: '#1D4ED8' },
            { label: 'GRE Premium',      count: 0, color: '#22C55E' },
            { label: 'GRE Quant',        count: 0, color: '#4ADE80' },
            { label: 'GRE Verbal',       count: 0, color: '#16A34A' },
            { label: 'GRE 1-on-1',       count: 0, color: '#86EFAC' },
            { label: 'GRE Mock Tests',   count: 0, color: '#15803D' },
            { label: 'GRE Portal',       count: 0, color: '#166534' },
            { label: 'Basic English',    count: 0, color: '#F97316' },
            { label: 'Spoken',           count: 0, color: '#FB923C' },
            { label: 'Service Charge',   count: 0, color: '#94A3B8' },
            { label: 'SSC English',      count: 0, color: '#FDBA74' },
            { label: 'Study Abroad',     count: 0, color: '#0D9488' },
            { label: 'Others',           count: 0, color: '#78716C' },
          ])
        }
      } catch (err: any) {
        const e = err instanceof Error ? err : new Error(err?.message || 'Could not load dashboard.')
        console.error('Admin dashboard fetch error:', e.message)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [fetchTick])

  const formatTimeAgo = (date: Date | string) => {
    const diffMs   = Date.now() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHrs  = Math.floor(diffMs / 3600000)
    if (diffMins < 1)  return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHrs  < 24) return `${diffHrs}h ago`
    return `${Math.floor(diffHrs / 24)}d ago`
  }

  const getActivityDot = (type: string) => ({
    success: 'bg-emerald-500 ring-emerald-100',
    info:    'bg-blue-500 ring-blue-100',
    warning: 'bg-amber-400 ring-amber-100',
    error:   'bg-red-500 ring-red-100',
  }[type] ?? 'bg-gray-400 ring-gray-100')

  const SOURCE_COLORS = ['#3B82F6','#22C55E','#FACE39','#A855F7','#F97316','#0EA5E9','#EC4899','#14B8A6','#F43F5E']

  const STAGE_CONFIG: Record<string, { bg: string; text: string; border: string; accent: string }> = {
    'New Inquiry': { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    accent: 'bg-blue-500'    },
    Contacted:     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   accent: 'bg-amber-500'   },
    'Trial Class': { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  accent: 'bg-orange-500'  },
    Enrolled:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-500' },
    Lost:          { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    accent: 'bg-rose-500'    },
  }

  const maxCourse = coursePerformance.length > 0 ? Math.max(...coursePerformance.map(s => s.count), 1) : 1

  if (error) throw error

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-[3px] border-[#FACE39] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400 tracking-wide">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Active BDMs',
      value: stats.activeBDMs.value,
      change: `+${stats.activeBDMs.change}`,
      positive: true,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
      bar: 'bg-blue-500',
    },
    {
      label: "Today's Leads",
      value: stats.todaysLead.value,
      change: `${stats.todaysLead.change >= 0 ? '+' : ''}${stats.todaysLead.change}%`,
      positive: stats.todaysLead.change >= 0,
      icon: <Target className="w-5 h-5 text-violet-600" />,
      iconBg: 'bg-violet-50',
      bar: 'bg-violet-500',
    },
    {
      label: 'Total Converted',
      value: stats.todaysConverted.value,
      change: `${stats.todaysConverted.change >= 0 ? '+' : ''}${stats.todaysConverted.change}%`,
      positive: stats.todaysConverted.change >= 0,
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      bar: 'bg-emerald-500',
    },
    {
      label: 'Follow Up Pending',
      value: stats.followupPending.value,
      change: `${stats.followupPending.change >= 0 ? '+' : ''}${stats.followupPending.change}%`,
      positive: stats.followupPending.change >= 0,
      icon: <Activity className="w-5 h-5 text-orange-500" />,
      iconBg: 'bg-orange-50',
      bar: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-4 pb-6">

      {/* ── Page header ── */}
      <div className="-mx-6 -mt-6 mb-4 p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Welcome back — here's what's happening today.</p>
        </div>
        <button
          onClick={() => setFetchTick(t => t + 1)}
          className="group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:text-gray-700 hover:bg-blue-50 transition-all duration-200 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`absolute inset-x-0 top-0 h-[3px] ${card.bar}`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.iconBg} p-2.5 rounded-xl`}>{card.icon}</div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${card.positive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {card.change}
              </span>
            </div>
            <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{card.label}</p>
            <p className="text-3xl font-black text-gray-900 tabular-nums leading-none">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Activity (3/5) + Top Performers (2/5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium tabular-nums">{recentActivity.length} events</span>
          </div>
          <div className="px-5 py-4 overflow-y-auto max-h-[256px] scrollbar-hide">
            {recentActivity.length === 0 ? (
              <div className="py-10 text-center">
                <Clock className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No recent activity.</p>
              </div>
            ) : recentActivity.map((item, idx) => (
              <div key={item.id} className="relative flex gap-3 pb-3.5">
                {idx < recentActivity.length - 1 && (
                  <div className="absolute left-[5px] top-3.5 bottom-0 w-px bg-gray-100" />
                )}
                <div className={`relative mt-1.5 w-2.5 h-2.5 rounded-full ring-4 shrink-0 ${getActivityDot(item.type)}`} />
                <div className="min-w-0 pt-0.5">
                  <p className="text-[13px] leading-snug">
                    <span className="font-semibold text-gray-800">{item.user}</span>
                    <span className="text-gray-400 ml-1">{item.action}</span>
                  </p>
                  <p className="text-[11px] text-gray-300 mt-0.5 font-medium">{formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Top Performers</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">This month</span>
          </div>
          <div className="px-4 py-3 overflow-y-auto max-h-[256px] scrollbar-hide space-y-0.5">
            {topPerformers.length === 0 ? (
              <div className="py-10 text-center">
                <TrendingUp className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No performers data yet.</p>
              </div>
            ) : topPerformers.map((p) => {
              const rate = parseFloat(p.conversionRate) || 0
              return (
                <div key={p.rank} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${p.rank === 1 ? 'bg-[#FACE39] text-gray-900' : p.rank === 2 ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-500'}`}>
                    {p.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(rate, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold shrink-0 tabular-nums">{p.convertedLeads}/{p.totalLeads}</span>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-emerald-600 shrink-0 tabular-nums">{p.conversionRate}%</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── Lead Stage Distribution ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Lead Stage Distribution</h2>
              <p className="text-[11px] text-gray-400">This month</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stageDistribution.length === 0 ? (
              <div className="col-span-full py-10 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">No stage data this month</p>
              </div>
            ) : stageDistribution.map((item) => {
              const cfg = STAGE_CONFIG[item.stage] ?? STAGE_CONFIG['New Inquiry']
              return (
                <div key={item.stage} className={`relative overflow-hidden p-4 rounded-xl border ${cfg.bg} ${cfg.border} text-center hover:shadow-sm transition-shadow`}>
                  <div className={`absolute inset-x-0 top-0 h-1 ${cfg.accent}`} />
                  <h4 className={`text-2xl font-black tabular-nums mt-1 ${cfg.text}`}>{item.count}</h4>
                  <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest opacity-70 ${cfg.text}`}>
                    {item.stage === 'Trial Class' ? 'Trial Class Leads' : item.stage === 'Lost' ? 'Lost Leads' : item.stage}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Charts: Stage Trend (3/5 wide) + Source Distribution (2/5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Lead Stage Trend */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Lead Stage Trend</h3>
              <p className="text-[11px] text-gray-400">Monthly breakdown</p>
            </div>
          </div>
          <div className="p-5">
            {mounted ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stageTrend} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} width={24} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '12px' }} />
                  <Line type="monotone" dataKey="Enrolled"    stroke="#22C55E" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Trial Class" stroke="#F97316" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="New Inquiry" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Contacted"   stroke="#A855F7" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[200px]" />}
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <div className="p-1.5 bg-violet-50 rounded-lg">
              <PieChartIcon className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Lead Source</h3>
              <p className="text-[11px] text-gray-400">By channel</p>
            </div>
          </div>
          <div className="p-5">
            {mounted ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={sourceDistribution} cx="50%" cy="40%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="percentage" nameKey="source" stroke="#fff" strokeWidth={2}>
                    {sourceDistribution.map((_e, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontWeight: 700 }} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '9px', fontWeight: 700, paddingTop: '8px', lineHeight: '1.8' }} formatter={(v) => <span style={{ fontSize: '9px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px]" />}
          </div>
        </div>

      </div>

      {/* ── Charts: Conversion Rate + Course Performance ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Conversion Rate Trend</h3>
              <p className="text-[11px] text-gray-400">Monthly conversion %</p>
            </div>
          </div>
          <div className="p-5">
            {mounted ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={conversionTrend} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} tickFormatter={v => `${v}%`} width={28} />
                  <Tooltip cursor={{ fill: 'rgba(250,206,57,0.08)', radius: 6 }} formatter={(v) => [`${v}%`, 'Rate']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                  <Bar dataKey="rate" fill="#FACE39" radius={[5, 5, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[200px]" />}
          </div>
        </div>

        {/* Monthly Course Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Monthly Course Performance</h3>
              <p className="text-[11px] text-gray-400">Enrollments by program</p>
            </div>
          </div>
          <div className="p-5">
            {coursePerformance.length > 0 ? (
              <div className="space-y-3">
                {coursePerformance.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 group">
                    <span className="text-[12px] font-semibold text-gray-600 w-28 shrink-0 truncate">{item.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${maxCourse > 0 ? (item.count / maxCourse) * 100 : 0}%`,
                          minWidth: item.count > 0 ? 4 : 0,
                          backgroundColor: item.color || '#FACE39',
                          opacity: item.count > 0 ? 1 : 0.12,
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-bold text-gray-800 tabular-nums w-4 text-right shrink-0">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <p className="text-sm font-medium text-gray-400">No course metrics yet</p>
                <p className="text-xs text-gray-300 mt-1">Course counts update as leads are tied to programs.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
