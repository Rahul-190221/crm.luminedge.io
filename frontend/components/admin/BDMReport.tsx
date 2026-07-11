'use client'

import { useState, useEffect } from 'react'
import { Download, Users, TrendingUp, Target, Phone, Mail, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import { getUsers } from '@/lib/api/auth'
import { getReports, getTaskStatus } from '@/lib/api/reports'
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'
import { Fragment } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getBdmColor } from '@/lib/helpers/bdmColors'

interface BDMPerformance {
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
  activities?: {
    type: string
    leadName: string
    date: string
    note: string
  }[]
}

interface ReportSummary {
  totalBDMs: number
  activeLeads: number
  convertedLeads: number
  overallConversionRate: number
  totalRevenue: number
  totalCalls: number
  totalEmails: number
  avgResponseTime: string
}

interface BDMTask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  entityId?: {
    _id: string;
    fullName?: string;
    name?: string;
  };
  dueDate?: string;
  completedAt?: string;
  completedBy?: { _id: string; name: string };
}

const getInitials = (name?: string): string => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    : name.charAt(0).toUpperCase()
}

export default function BDMReport() {
  const [reportMode, setReportMode] = useState<'performance' | 'tasks'>('performance')
  const [dateRange, setDateRange] = useState('this_month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBDM, setSelectedBDM] = useState('all')
  const [bdmList, setBdmList] = useState<{ _id: string; name: string }[]>([])
  const [performances, setPerformances] = useState<BDMPerformance[]>([])
  const [tasks, setTasks] = useState<BDMTask[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedBDMId, setExpandedBDMId] = useState<string | null>(null)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    fetchBDMList()
  }, [])

  useEffect(() => {
    fetchReportData()
  }, [reportMode, dateRange, selectedBDM, selectedMonth, selectedYear, specificDate, bdmList])

  const fetchBDMList = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const data = await getUsers(token, 'bdm');
        setBdmList(data.map((u: any) => ({ 
          _id: u._id, 
          name: u.name || `${u.firstName} ${u.lastName}` 
        })));
      }
    } catch (error) {
      console.error('Error fetching BDM list:', error)
      setBdmList([])
    }
  }

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      if (reportMode === 'performance') {
        const options: any = { range: dateRange, bdm: selectedBDM }
        if (dateRange === 'custom') {
          options.startDate = startDate
          options.endDate = endDate
        } else if (dateRange === 'monthly') {
          options.month = selectedMonth
          options.year = selectedYear
        } else if (dateRange === 'specific_date') {
          options.startDate = specificDate
        }

        const [data, bdmUsers] = await Promise.all([
          getReports(token, options),
          getUsers(token, 'bdm').catch(() => []),
        ])
        const nameMap = new Map<string, string>(
          bdmUsers.map((u: any) => [
            String(u._id),
            u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          ])
        )
        const enriched = (data.performances || []).map((p: any) => {
          const perfId = String(p._id || p.userId || p.id || '')
          return { ...p, name: p.name || nameMap.get(perfId) || '' }
        })
        setPerformances(enriched)
        setSummary(data.summary || null)
        setTasks([])
      } else {
        if (selectedBDM === 'all') {
          setTasks([])
          setIsLoading(false)
          return
        }
        const data = await getTaskStatus(token, selectedBDM, specificDate)
        setTasks(data || [])
        setPerformances([])
        setSummary(null)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      setPerformances([])
      setSummary(null)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = () => {
    fetchReportData()
  }

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4'
    })

    // Header
    doc.setFontSize(20)
    doc.setTextColor(20, 20, 20)
    doc.text('Luminedge CRM - BDM Performance Report', 14, 20)

    // Report Meta
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    
    let reportPeriod = ''
    if (dateRange === 'monthly') {
      reportPeriod = `${months[selectedMonth]} ${selectedYear}`
    } else if (dateRange === 'specific_date') {
      reportPeriod = specificDate
    } else if (dateRange === 'custom') {
      reportPeriod = `${startDate} to ${endDate}`
    } else {
      reportPeriod = dateRange.replace('_', ' ').charAt(0).toUpperCase() + dateRange.replace('_', ' ').slice(1)
    }

    const bdmName = selectedBDM === 'all' ? 'All BDMs' : bdmList.find(b => b._id === selectedBDM)?.name || 'Unknown BDM'
    
    doc.text(`Period: ${reportPeriod}`, 14, 30)
    doc.text(`BDM: ${bdmName}`, 14, 35)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40)

    // Summary Section
    if (summary) {
      doc.setFillColor(250, 250, 250)
      doc.rect(14, 45, 269, 20, 'F')
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      
      const summaryItems = [
        `Total BDMs: ${summary.totalBDMs}`,
        `Conversions: ${summary.convertedLeads}`,
        `Conv. Rate: ${formatPercent(summary.overallConversionRate)}`,
        `Revenue: ${formatCurrency(summary.totalRevenue)}`,
        `Total Calls: ${summary.totalCalls}`,
        `Total Emails: ${summary.totalEmails}`
      ]
      
      doc.text(summaryItems.join('   |   '), 20, 57)
    }

    // Performance Table
    const tableData = performances.map((perf, index) => [
      index + 1,
      perf.name,
      getRoleLabel(perf.role),
      perf.leadsAssigned,
      perf.leadsConverted,
      formatPercent(perf.conversionRate),
      perf.totalCalls,
      perf.totalEmails,
      perf.avgResponseTime,
      formatCurrency(perf.revenue)
    ])

    autoTable(doc, {
      startY: 70,
      head: [['#', 'BDM Name', 'Role', 'Leads Assigned', 'Converted', 'Conv. Rate', 'Calls', 'Emails', 'Avg Response', 'Revenue']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [250, 206, 57],
        textColor: [20, 20, 20],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center', fontStyle: 'bold' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center' },
        9: { halign: 'right', fontStyle: 'bold' }
      }
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${pageCount}`, 260, 200, { align: 'right' })
      doc.text('Luminedge CRM - Confidental Report', 14, 200)
    }

    const filename = `BDM_Report_${bdmName.replace(/\s+/g, '_')}_${reportPeriod.replace(/\s+/g, '_')}.pdf`
    doc.save(filename)
  }

  const handleExportReport = () => {
    if (performances.length === 0) {
      alert('No data available to export.')
      return
    }
    generatePDF()
  }

  const getRoleLabel = (role: string): string => role === 'bdm' ? 'BDM' : role

  const formatCurrency = (amount: any): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formatPercent = (val: any): string => {
    if (typeof val === 'string') {
      return val.replace('%', '') + '%'
    }
    return (val || 0).toString() + '%'
  }

  const getConversionColor = (rate: any): string => {
    const num = typeof rate === 'string' ? parseFloat(rate) : rate
    if (isNaN(num)) return 'text-gray-600'
    if (num >= 60) return 'text-green-600'
    if (num >= 40) return 'text-blue-600'
    return 'text-red-600'
  }

  const formatCompletedAt = (d?: string): string => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Page Header */}
      <div className="-mx-6 -mt-6 mb-4 p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">BDM Reports</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">View performance metrics and task status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button
              onClick={() => setReportMode('performance')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${reportMode === 'performance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Performance
            </button>
            <button
              onClick={() => setReportMode('tasks')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${reportMode === 'tasks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Task Status
            </button>
          </div>
          <button
            onClick={handleExportReport}
            className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-[14px] font-semibold text-[#00000F]/80 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Report Category / Date Range */}
          {reportMode === 'performance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                title="Select date range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
              >
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
          )}

          {/* Specific Date Picker */}
          {(dateRange === 'specific_date' || reportMode === 'tasks') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                title="Select date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent"
              />
            </div>
          )}

          {/* Monthly Selectors */}
          {reportMode === 'performance' && dateRange === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  title="Select month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  title="Select year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Custom Date Range */}
          {reportMode === 'performance' && dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  title="Start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  title="End date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* BDM Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BDM</label>
            <select
              title="Filter by BDM"
              value={selectedBDM}
              onChange={(e) => setSelectedBDM(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/40 focus:border-transparent bg-white"
            >
              {reportMode === 'performance' && <option value="all">All BDMs</option>}
              {bdmList.map(bdm => (
                <option key={bdm._id} value={bdm._id}>{bdm.name}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {reportMode === 'performance' ? (
        <>
          {/* Summary Stats */}
          {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#00000F]/85">{summary.totalBDMs}</p>
                <p className="text-xs text-gray-500">Total BDMs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#00000F]/85">{summary.convertedLeads}</p>
                <p className="text-xs text-gray-500">Conversions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatPercent(summary.overallConversionRate)}</p>
                <p className="text-xs text-gray-500">Conversion Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Table */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#00000F]/[0.06]">
          <h2 className="text-[14px] font-semibold text-[#00000F]/80">Performance Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600">
                <th className="text-left px-4 py-3 text-sm font-semibold text-white">BDM</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Leads Assigned</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Converted</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Conv. Rate</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Calls</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Emails</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-white">Avg Response</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-white">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : performances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                performances.map((perf, index) => {
                  const displayName = perf.name || bdmList.find(b => b._id === String(perf._id))?.name || 'Unknown BDM'
                  return (
                  <Fragment key={perf._id}>
                    <tr
                      className={`cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${expandedBDMId === perf._id ? 'bg-blue-50/50' : 'hover:bg-gray-100/50'}`}
                      onClick={() => setExpandedBDMId(expandedBDMId === perf._id ? null : perf._id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 group-hover:text-gray-600">
                            {expandedBDMId === perf._id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                            style={{ backgroundColor: getBdmColor(displayName).bg, color: getBdmColor(displayName).text }}
                          >
                            {getInitials(displayName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{displayName}</p>
                            <p className="text-xs text-gray-500">{getRoleLabel(perf.role)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">{perf.leadsAssigned}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">{perf.leadsConverted}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${getConversionColor(perf.conversionRate)}`}>
                          {formatPercent(perf.conversionRate)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{perf.totalCalls}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{perf.totalEmails}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{perf.avgResponseTime}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">{formatCurrency(perf.revenue)}</td>
                    </tr>
                    
                    {expandedBDMId === perf._id && (
                      <tr>
                        <td colSpan={9} className="px-4 py-0">
                          <div className="py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-lg mb-2">
                            <div className="flex items-center justify-between mb-4 px-8">
                              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                Activities this month
                              </h3>
                              <span className="text-xs text-gray-500">Showing last 50 actions</span>
                            </div>
                            
                            <div className="space-y-3 px-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                              {perf.activities && perf.activities.length > 0 ? (
                                perf.activities.map((act, i) => (
                                  <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                      <div className={`p-1.5 rounded-full ${
                                        act.type === 'call' ? 'bg-blue-100 text-blue-600' :
                                        act.type === 'email' ? 'bg-purple-100 text-purple-600' :
                                        act.type === 'whatsapp' ? 'bg-green-100 text-green-600' :
                                        act.type === 'lead_converted' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-500'
                                      }`}>
                                        {act.type === 'call' ? <Phone className="w-3 h-3" /> :
                                         act.type === 'email' ? <Mail className="w-3 h-3" /> :
                                         act.type === 'whatsapp' ? <MessageSquare className="w-3 h-3" /> :
                                         act.type === 'lead_converted' ? <CheckCircle className="w-3 h-3" /> :
                                         act.type === 'lead_created' ? <Users className="w-3 h-3" /> :
                                         <Clock className="w-3 h-3" />}
                                      </div>
                                      {i < perf.activities!.length - 1 && <div className="w-px h-full bg-gray-200 mt-2"></div>}
                                    </div>
                                    <div className="pb-4">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-900">{act.leadName}</span>
                                        <span className="text-[12px] text-gray-400">
                                          {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 line-clamp-2 italic">"{act.note}"</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500 py-4 text-center">No detailed activities logged for this period.</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Metrics */}
      {summary && (
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-[14px] font-semibold text-[#00000F]/80 mb-4">Activity Metrics</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-[#00000F]/85">{summary.totalCalls}</p>
              <p className="text-sm text-gray-500">Total Calls</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-[#00000F]/85">{summary.totalEmails}</p>
              <p className="text-sm text-gray-500">Total Emails</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xl font-bold text-[#00000F]/85">{summary.activeLeads}</p>
              <p className="text-sm text-gray-500">Active Leads</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-xl font-bold text-[#00000F]/85">{summary.avgResponseTime}</p>
              <p className="text-sm text-gray-500">Avg Response Time</p>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        /* Task Status View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <h3 className="font-semibold text-gray-900">Pending Tasks</h3>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                {tasks.filter(t => t.status === 'pending').length}
              </span>
            </div>
            
            {isLoading ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : tasks.filter(t => t.status === 'pending').length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500 text-sm italic">
                No pending tasks for this date
              </div>
            ) : (
              tasks.filter(t => t.status === 'pending').map(task => (
                <div key={task._id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50 text-[12px] text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>Lead: {task.entityId?.fullName || task.entityId?.name || 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <h3 className="font-semibold text-gray-900">In Progress</h3>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                {tasks.filter(t => t.status === 'in-progress').length}
              </span>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : tasks.filter(t => t.status === 'in-progress').length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500 text-sm italic">
                No tasks currently in progress
              </div>
            ) : (
              tasks.filter(t => t.status === 'in-progress').map(task => (
                <div key={task._id} className="bg-white rounded-xl p-4 border border-blue-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50 text-[12px] text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>Lead: {task.entityId?.fullName || task.entityId?.name || 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Completed Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <h3 className="font-semibold text-gray-900">Completed</h3>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                {tasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            {isLoading ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : tasks.filter(t => t.status === 'completed').length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500 text-sm italic">
                No completed tasks for this date
              </div>
            ) : (
              tasks.filter(t => t.status === 'completed').map(task => (
                <div key={task._id} className="bg-white rounded-xl p-4 border border-green-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {task.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="mt-auto pt-3 border-t border-gray-50 space-y-1.5">
                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>Lead: {task.entityId?.fullName || task.entityId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-green-600">
                      <Clock className="w-3 h-3" />
                      <span>{formatCompletedAt(task.completedAt)}</span>
                    </div>
                    {task.completedBy?.name && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <CheckCircle className="w-3 h-3 text-gray-400" />
                        <span>By: {task.completedBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
