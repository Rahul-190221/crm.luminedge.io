'use client'

import { Edit2 } from 'lucide-react'
import type { MockTestPackage } from '@/types/admin'
interface MockTestPackageCardProps {
  package_: MockTestPackage
  onEdit: (pkg: MockTestPackage) => void
}

export default function MockTestPackageCard({ package_, onEdit, user }: MockTestPackageCardProps & { user?: any }) {
  const isAdmin = user?.role === 'admin';
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm border-l-4 border-l-[#FACE39]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{package_.testType} Mock Test Packages</h3>
        {isAdmin && (
          <button
            onClick={() => onEdit(package_)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        {package_.description || 'We have paper-based and computer-delivered mock tests.'}
      </p>

      {/* Features List */}
      <ul className="space-y-2 mb-5">
        {package_.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-[#FACE39] rounded-full"></span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Pricing Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#FACE39] px-4 py-2.5 grid grid-cols-2">
          <span className="text-sm font-semibold text-gray-900">No. of Mock Test</span>
          <span className="text-sm font-semibold text-gray-900">Fee</span>
        </div>
        {package_.pricing.map((item, index) => (
          <div
            key={index}
            className={`px-4 py-2.5 grid grid-cols-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <span className="text-sm text-gray-700">{item.testCount} Mock Test Fee</span>
            <span className="text-sm text-gray-700">BDT {item.fee.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
