'use client'

interface BDMDashboardProps {
  activePage: string
  setActivePage: (page: string) => void
}

export default function BDMDashboard({ activePage, setActivePage }: BDMDashboardProps) {
  const bdmStats = [
    {
      label: 'Total Leads',
      value: '248',
      change: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Converted',
      value: '89',
      change: '+8%',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'In Progress',
      value: '124',
      change: '+5%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Target',
      value: '92%',
      change: '+3%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const recentLeads = [
    { name: 'Sarah Johnson', company: 'IELTS Coaching', phone: '+880 1234-567890', time: '2 hours ago', status: 'Hot' },
    { name: 'Michael Chen', company: 'PTE Preparation', phone: '+880 1234-567891', time: '4 hours ago', status: 'Processing' },
    { name: 'Emily Davis', company: 'GRE Test Prep', phone: '+880 1234-567892', time: '6 hours ago', status: 'Intake' },
    { name: 'James Wilson', company: 'TOEFL Course', phone: '+880 1234-567893', time: '8 hours ago', status: 'Hot' },
  ]

  const upcomingTasks = [
    { task: 'Follow up with Sarah Johnson', date: '2025-11-07', priority: 'High' },
    { task: 'Send quotation to Michael Chen', date: '2025-11-07', priority: 'Medium' },
    { task: 'Schedule demo class for Emily Davis', date: '2025-11-08', priority: 'High' },
    { task: 'Review application from James Wilson', date: '2025-11-08', priority: 'Low' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">BDM Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here's your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bdmStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <div className={`w-6 h-6 ${stat.color}`}></div>
              </div>
              <div className={`text-sm font-bold ${stat.color}`}>
                {stat.change}
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Leads & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Leads</h2>
          <div className="space-y-4">
            {recentLeads.map((lead, i) => (
              <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{lead.company}</p>
                    <p className="text-xs text-gray-400 mt-1">{lead.phone}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded ${
                    lead.status === 'Hot' ? 'bg-red-100 text-red-700' :
                    lead.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-3">{lead.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Upcoming Tasks</h2>
          <div className="space-y-4">
            {upcomingTasks.map((item, i) => (
              <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.task}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    item.priority === 'High' ? 'bg-red-100 text-red-700' :
                    item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
