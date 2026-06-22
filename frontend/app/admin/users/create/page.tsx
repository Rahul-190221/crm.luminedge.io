import dynamic from 'next/dynamic'

const CreateUserPage = dynamic(() => import('@/components/admin/CreateUserPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#fafafa]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FACE39] border-t-[#00000F]" />
    </div>
  ),
})

export default function AdminCreateUserPage() {
  return <CreateUserPage />
}
