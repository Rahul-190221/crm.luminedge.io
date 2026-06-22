import dynamic from 'next/dynamic'

const DashboardRouteClient = dynamic(() => import('@/components/dashboard/DashboardRouteClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FACE39] mx-auto mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  ),
})

export default function DashboardPage() {
  return <DashboardRouteClient />
}
