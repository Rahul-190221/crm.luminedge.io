'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LeadDetail from '@/components/leads/LeadDetail';
import { getUserIdFromToken } from '@/lib/helpers/jwt';

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    const decoded = getUserIdFromToken();
    if (!decoded) {
      router.replace('/login');
      return;
    }

    if (decoded.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center text-sm text-gray-500">Loading lead details...</div>
      </div>
    );
  }

  return <LeadDetail id={id} onBack={() => router.back()} />;
}
