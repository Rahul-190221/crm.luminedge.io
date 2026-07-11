'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  BarChart3, TrendingUp, Users, Target, RefreshCw,
  Download, Phone, Mail, CheckCircle, Clock,
  ChevronDown, ChevronRight, MessageSquare, Trophy,
} from 'lucide-react'
import { getAdminDashboardAll, getLeadSourceDistribution, getLeadStageTrend } from '@/lib/api/dashboard'
import { getReports, getTaskStatus } from '@/lib/api/reports'
import { getUsers } from '@/lib/api/auth'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getBdmColor } from '@/lib/helpers/bdmColors'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalLeads: number
  convertedLeads: number
  conversionRate: number
  totalBDMs: number
  newLeadsToday: number
  activeLeads: number
}

interface TopPerformer {
  _id: string
  id?: string
  name: string
  conversionRate: number
  totalLeads: number
  convertedLeads: number
}

interface StageData { name: string; count: number; color: string }
interface SourceData { source: string; count: number; percentage: number }
interface TrendPoint { month: string; [key: string]: number | string }

interface BDMPerf {
  _id: string
  name: string
  role: string
  leadsAssigned: number
  leadsConverted: number
  conversionRate: number
  totalCalls: number
  totalEmails: number
  avgResponseTime: string
  revenue: number
  activities?: { type: string; leadName: string; date: string; note: string }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  'New Inquiry': '#3b82f6',
  Contacted: '#8b5cf6',
  'Trial Class': '#f97316',
  Enrolled: '#22c55e',
  Lost: '#ef4444',
}

const SOURCE_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ef4444', '#14b8a6', '#06b6d4']

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name?: string) => {
  if (!name) return '?'
  const p = name.split(' ')
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : name[0].toUpperCase()
}

const fmt = (n: any) => (typeof n === 'string' ? parseFloat(n) : n) || 0

const fmtPct = (v: any) => `${fmt(v)}%`

const fmtCurrency = (v: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(fmt(v))

const convColor = (r: any) => {
  const n = fmt(r)
  if (n >= 60) return 'text-green-600'
  if (n >= 40) return 'text-blue-600'
  return 'text-red-600'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, color, value, label }: { icon: any; color: string; value: string | number; label: string }) => (
  <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-[#00000F]/85">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  </div>
)

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] ${className}`}>
    {children}
  </div>
)

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
  </div>
)

// ─── Tab 1: Overview ──────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAdminDashboardAll()
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to load admin dashboard data')
      }
      setData(response.data ?? response)
    } catch (error) {
      console.error('Overview tab load failed:', error)
      setData(null)
    }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Spinner />

  const payload = data?.data ?? data ?? {}

  // Backend returns each stat as {value, change} — extract the numeric value
  const extractVal = (v: any, fallback: number = 0): number => {
    if (v !== null && v !== undefined && typeof v === 'object' && 'value' in v) {
      return parseFloat(String(v.value)) || fallback
    }
    return parseFloat(String(v ?? fallback)) || fallback
  }
  const rawStats = payload?.stats ?? {}
  const stats: AdminStats = {
    totalLeads:     extractVal(rawStats.totalLeads, 0),
    convertedLeads: extractVal(rawStats.convertedLeads ?? rawStats.todaysConverted, 0),
    conversionRate: extractVal(rawStats.conversionRate, 0),
    totalBDMs:      extractVal(rawStats.activeBDMs ?? rawStats.totalBDMs, 0),
    newLeadsToday:  extractVal(rawStats.todaysLead, 0),
    activeLeads:    extractVal(rawStats.activeLeads, 0),
  }

  const topPerformers: TopPerformer[] = payload?.topPerformers ?? []
  const stageDistribution: StageData[] = (payload?.stageDistribution ?? []).map((s: any) => ({
    name: s._id ?? s.name ?? s.stage ?? '',
    count: s.count ?? 0,
    color: STAGE_COLORS[s._id ?? s.name ?? ''] ?? '#94a3b8',
  }))
  const conversionTrend: TrendPoint[] = (payload?.conversionTrend ?? []).map((p: any) => ({
    month: p.month ?? p._id ?? '',
    rate: fmt(p.rate ?? p.conversionRate ?? 0),
  }))
  const sourceDistribution: SourceData[] = (payload?.sourceDistribution ?? []).map((s: any) => ({
    source: s._id ?? s.source ?? '',
    count: s.count ?? 0,
    percentage: fmt(s.percentage ?? 0),
  }))

  const totalLeadsFromStages = stageDistribution.reduce((a, s) => a + s.count, 0) || 1

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Users}      color="bg-blue-100 text-blue-600"    value={stats.totalLeads ?? 0}     label="Total Leads" />
        <KpiCard icon={Target}     color="bg-green-100 text-green-600"  value={stats.convertedLeads ?? 0} label="Converted" />
        <KpiCard icon={TrendingUp} color="bg-purple-100 text-purple-600" value={fmtPct(stats.conversionRate ?? 0)} label="Conversion Rate" />
        <KpiCard icon={Users}      color="bg-blue-100 text-blue-600" value={stats.totalBDMs ?? 0}     label="Active BDMs" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Trend */}
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-[#00000F]/70 uppercase tracking-wider mb-4">Conversion Rate Trend</h3>
          {conversionTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">No trend data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={conversionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Conversion Rate']} />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Stage Distribution */}
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-[#00000F]/70 uppercase tracking-wider mb-4">Lead Stage Distribution</h3>
          {stageDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">No stage data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageDistribution} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stageDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Pie */}
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-[#00000F]/70 uppercase tracking-wider mb-4">Lead Source Breakdown</h3>
          {sourceDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">No source data available</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={sourceDistribution} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={72} innerRadius={36}>
                    {sourceDistribution.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {sourceDistribution.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                      <span className="text-[12px] text-gray-600 truncate">{s.source}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-gray-800 flex-shrink-0">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Top Performers */}
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-[#00000F]/70 uppercase tracking-wider mb-4">Top Performers</h3>
          {topPerformers.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">No performer data available</div>
          ) : (
            <div className="space-y-3">
              {topPerformers.slice(0, 5).map((p, i) => (
                <div key={p._id ?? p.id ?? `${p.name}-${i}`} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i === 0 ? 'bg-blue-600 text-white' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                    {i + 1}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: getBdmColor(p.name).bg, color: getBdmColor(p.name).text }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.convertedLeads}/{p.totalLeads} leads</p>
                  </div>
                  <span className={`text-sm font-bold ${convColor(p.conversionRate)}`}>{fmtPct(p.conversionRate)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Stage progress bars */}
      {stageDistribution.length > 0 && (
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-[#00000F]/70 uppercase tracking-wider mb-4">Stage Breakdown</h3>
          <div className="space-y-3">
            {stageDistribution.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600 flex-shrink-0">{s.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(s.count / totalLeadsFromStages) * 100}%`, background: s.color }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-gray-800">{s.count}</span>
                <span className="w-12 text-right text-xs text-gray-400">{((s.count / totalLeadsFromStages) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Tab 2: Lead Analytics ────────────────────────────────────────────────────

function LeadAnalyticsTab() {
  const [stageTrend, setStageTrend] = useState<TrendPoint[]>([])
  const [sources, setSources] = useState<SourceData[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [trendRaw, sourceRaw] = await Promise.all([
        getLeadStageTrend(),
        getLeadSourceDistribution(),
      ])
      // Normalise trend: [{month, 'New Inquiry', Contacted, 'Trial Class', Enrolled, Lost}]
      const trendMap: Record<string, TrendPoint> = {}
      const rawArr = Array.isArray(trendRaw) ? trendRaw : (trendRaw?.data ?? [])
      rawArr.forEach((item: any) => {
        const mo = item.month ?? item._id?.month ?? item._id ?? ''
        if (!trendMap[mo]) trendMap[mo] = { month: mo }
        const stage = item.stage ?? item._id?.stage ?? ''
        if (stage) trendMap[mo][stage] = item.count ?? 0
      })
      setStageTrend(Object.values(trendMap))

      const srcArr = Array.isArray(sourceRaw) ? sourceRaw : (sourceRaw?.data ?? [])
      setSources(srcArr.map((s: any) => ({
        source: s._id ?? s.source ?? '',
        count: s.count ?? 0,
        percentage: fmt(s.percentage ?? 0),
      })))
    } catch { /* empty state */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Spinner />

  const totalSrc = sources.reduce((a, s) => a + s.count, 0) || 1
  const stageKeys = ['New Inquiry', 'Contacted', 'Trial Class', 'Enrolled', 'Lost']

  return (
    <div className="space-y-5">
      {/* Stage Trend Area Chart */}
      <Card className="p-5">
        <h3 className="text-[13px] font-semibold text-[#00000F]/70 uppercase tracking-wider mb-4">Lead Stage Trend (6 months)</h3>
        {stageTrend.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-sm text-gray-400">No trend data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {stageKeys.map((s) => (
                <Area key={s} type="monotone" dataKey={s} stackId="1"
                  stroke={STAGE_COLORS[s]} fill={STAGE_COLORS[s]} fillOpacity={0.55} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Source Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#00000F]/[0.06]">
          <h3 className="text-[14px] font-semibold text-[#00000F]/80">Lead Source Analysis</h3>
        </div>
        {sources.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No source data available</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sources.map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                <span className="flex-1 text-sm text-gray-700 font-medium">{s.source || '—'}</span>
                <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(s.count / totalSrc) * 100}%`, background: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-gray-800">{s.count}</span>
                <span className="w-12 text-right text-xs text-gray-400">{((s.count / totalSrc) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Tab 3: BDM Performance ───────────────────────────────────────────────────

function BDMPerformanceTab() {
  const [dateRange, setDateRange] = useState('this_month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBDM, setSelectedBDM] = useState('all')
  const [bdmList, setBdmList] = useState<{ _id: string; name: string }[]>([])
  const [performances, setPerformances] = useState<BDMPerf[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    getUsers(token, 'bdm')
      .then((d) => setBdmList(d.map((u: any) => ({ _id: u._id, name: u.name || `${u.firstName} ${u.lastName}` }))))
      .catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return
      const opts: any = { range: dateRange, bdm: selectedBDM }
      if (dateRange === 'custom') { opts.startDate = startDate; opts.endDate = endDate }
      else if (dateRange === 'monthly') { opts.month = selectedMonth; opts.year = selectedYear }
      else if (dateRange === 'specific_date') { opts.startDate = specificDate }
      const [data, bdmUsers] = await Promise.all([
        getReports(token, opts),
        getUsers(token, 'bdm').catch(() => []),
      ])
      const nameMap = new Map<string, string>(bdmUsers.map((u: any) => [String(u._id), u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email]))
      setPerformances((data.performances ?? []).map((p: any) => ({
        ...p, name: p.name || nameMap.get(String(p._id ?? p.userId ?? '')) || '',
      })))
      setSummary(data.summary ?? null)
    } catch { setPerformances([]); setSummary(null) }
    finally { setLoading(false) }
  }, [dateRange, selectedBDM, startDate, endDate, selectedMonth, selectedYear, specificDate])

  useEffect(() => { fetchData() }, [fetchData])

  const exportPDF = () => {
    if (!performances.length) return alert('No data to export.')
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' })
    doc.setFontSize(18); doc.text('Luminedge CRM – BDM Performance Report', 14, 18)
    doc.setFontSize(9); doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25)
    autoTable(doc, {
      startY: 32,
      head: [['BDM', 'Leads', 'Converted', 'Conv.%', 'Calls', 'Emails', 'Avg Response', 'Revenue']],
      body: performances.map((p) => [
        p.name, p.leadsAssigned, p.leadsConverted, fmtPct(p.conversionRate),
        p.totalCalls, p.totalEmails, p.avgResponseTime, fmtCurrency(p.revenue),
      ]),
      headStyles: { fillColor: [250, 206, 57], textColor: [20, 20, 20], fontStyle: 'bold' },
      styles: { fontSize: 8 },
    })
    doc.save(`BDM_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const periodLabel = () => {
    if (dateRange === 'monthly') return `${months[selectedMonth]} ${selectedYear}`
    if (dateRange === 'specific_date') return specificDate
    if (dateRange === 'custom') return `${startDate} → ${endDate}`
    return dateRange.replace(/_/g, ' ')
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card className="p-5">
        <h3 className="text-[14px] font-semibold text-[#00000F]/80 mb-4">Filter Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400/40 focus:border-transparent">
              <option value="today">Today</option>
              <option value="specific_date">Specific Date</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="monthly">Monthly</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'specific_date' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent" />
            </div>
          )}

          {dateRange === 'monthly' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(+e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400/40 focus:border-transparent">
                  {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(+e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400/40 focus:border-transparent">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent" />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">BDM</label>
            <select value={selectedBDM} onChange={(e) => setSelectedBDM(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400/40 focus:border-transparent">
              <option value="all">All BDMs</option>
              {bdmList.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={fetchData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Generate
            </button>
          </div>
        </div>
      </Card>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={Users}      color="bg-blue-100 text-blue-600"    value={summary.totalBDMs}                    label="Total BDMs" />
          <KpiCard icon={Target}     color="bg-green-100 text-green-600"  value={summary.convertedLeads}               label="Conversions" />
          <KpiCard icon={TrendingUp} color="bg-purple-100 text-purple-600" value={fmtPct(summary.overallConversionRate)} label="Conv. Rate" />
          <KpiCard icon={BarChart3}  color="bg-blue-100 text-blue-600" value={fmtCurrency(summary.totalRevenue)}    label="Revenue" />
        </div>
      )}

      {/* Performance Bar Chart */}
      {!loading && performances.length > 0 && (
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-[#00000F]/70 uppercase tracking-wider mb-4">Conversion Rate by BDM</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performances.map((p) => ({ name: p.name || 'BDM', rate: fmt(p.conversionRate) }))} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip formatter={(v) => [`${v}%`, 'Conversion Rate']} />
              <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Performance Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#00000F]/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#00000F]/80">Performance Metrics</h3>
            <p className="text-xs text-gray-400 mt-0.5">{periodLabel()}</p>
          </div>
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white">BDM</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-white">Leads</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-white">Converted</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-white">Conv.%</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-white">Calls</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-white">Emails</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-white">Avg Response</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mx-auto" /></td></tr>
              ) : performances.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">No data for selected period</td></tr>
              ) : (
                performances.map((p, idx) => (
                  <Fragment key={p._id}>
                    <tr
                      className={`cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${expandedId === p._id ? 'bg-blue-50/40' : 'hover:bg-gray-100/60'}`}
                      onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-gray-300">{expandedId === p._id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}</span>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: getBdmColor(p.name).bg, color: getBdmColor(p.name).text }}
                          >
                            {getInitials(p.name)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{p.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{p.leadsAssigned}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{p.leadsConverted}</td>
                      <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${convColor(p.conversionRate)}`}>{fmtPct(p.conversionRate)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{p.totalCalls}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{p.totalEmails}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">{p.avgResponseTime}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{fmtCurrency(p.revenue)}</td>
                    </tr>
                    {expandedId === p._id && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50/50 px-10 py-4 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-500" /> Activity Timeline
                          </p>
                          {p.activities && p.activities.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {p.activities.map((a, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                  <div className={`p-1 rounded-full flex-shrink-0 ${
                                    a.type === 'call' ? 'bg-blue-100 text-blue-600' :
                                    a.type === 'email' ? 'bg-purple-100 text-purple-600' :
                                    a.type === 'whatsapp' ? 'bg-green-100 text-green-600' :
                                    a.type === 'lead_converted' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {a.type === 'call' ? <Phone className="w-3 h-3" /> :
                                     a.type === 'email' ? <Mail className="w-3 h-3" /> :
                                     a.type === 'whatsapp' ? <MessageSquare className="w-3 h-3" /> :
                                     a.type === 'lead_converted' ? <CheckCircle className="w-3 h-3" /> :
                                     <Clock className="w-3 h-3" />}
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-gray-800">{a.leadName}</span>
                                    <span className="text-[11px] text-gray-400 ml-2">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    <p className="text-[11px] text-gray-500 italic mt-0.5">"{a.note}"</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No activities logged for this period.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Phone,        color: 'bg-blue-100 text-blue-600',   value: summary.totalCalls,     label: 'Total Calls' },
            { icon: Mail,         color: 'bg-purple-100 text-purple-600', value: summary.totalEmails,  label: 'Total Emails' },
            { icon: CheckCircle,  color: 'bg-green-100 text-green-600', value: summary.activeLeads,    label: 'Active Leads' },
            { icon: Clock,        color: 'bg-orange-100 text-orange-600', value: summary.avgResponseTime, label: 'Avg Response' },
          ].map(({ icon, color, value, label }) => (
            <KpiCard key={label} icon={icon} color={color} value={value ?? 0} label={label} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'lead-analytics' | 'bdm-performance'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',        label: 'Overview' },
  { id: 'lead-analytics',  label: 'Lead Analytics' },
  { id: 'bdm-performance', label: 'BDM Performance' },
]

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  return (
    <div className="space-y-4 pb-6">
      {/* Page Header */}
      <div className="-mx-6 -mt-6 mb-4 p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Comprehensive analytics across leads, conversions, and team performance</p>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === t.id
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview'        && <OverviewTab />}
      {activeTab === 'lead-analytics'  && <LeadAnalyticsTab />}
      {activeTab === 'bdm-performance' && <BDMPerformanceTab />}
    </div>
  )
}
