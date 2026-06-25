import dynamic from 'next/dynamic'

const CreateUserPage = dynamic(() => import('@/components/admin/CreateUserPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#fafafa]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-blue-900" />
    </div>
  ),
})

export default function AdminCreateUserPage() {
  return <CreateUserPage />
}
