'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { MockTestPackage, TestType } from '@/types/admin'

interface AddMockTestPackageModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (pkg: Omit<MockTestPackage, '_id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: (pkg: MockTestPackage) => void
  editingPackage?: MockTestPackage | null
}

const testTypes: TestType[] = ['IELTS', 'PTE', 'GRE', 'TOEFL']

export default function AddMockTestPackageModal({ isOpen, onClose, onSubmit, onDelete, editingPackage }: AddMockTestPackageModalProps) {
  const [formData, setFormData] = useState({
    testType: '' as TestType | '',
    description: 'We have paper-based and computer-delivered mock tests.',
    features: ['Flexible mock test schedule', 'Real exam experience', 'Official test standard question', 'Result published in quick time', 'Detailed mock feedback', 'Wireless headphones'],
    pricing: [
      { testCount: 1, fee: 1550 },
      { testCount: 3, fee: 3000 },
      { testCount: 5, fee: 4500 }
    ],
    isActive: true
  })

  useEffect(() => {
    if (editingPackage) {
      setFormData({
        testType: editingPackage.testType,
        description: editingPackage.description || 'We have paper-based and computer-delivered mock tests.',
        features: editingPackage.features || [],
        pricing: editingPackage.pricing || [],
        isActive: editingPackage.isActive
      })
    } else {
      setFormData({
        testType: '',
        description: 'We have paper-based and computer-delivered mock tests.',
        features: ['Feature 1'],
        pricing: [{ testCount: 1, fee: 1550 }],
        isActive: true
      })
    }
  }, [editingPackage, isOpen])

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const handleAddPricing = () => {
    setFormData({
      ...formData,
      pricing: [...formData.pricing, { testCount: formData.pricing.length + 1, fee: 0 }]
    })
  }

  const handleRemovePricing = (index: number) => {
    setFormData({
      ...formData,
      pricing: formData.pricing.filter((_, i) => i !== index)
    })
  }

  const handlePricingChange = (index: number, field: 'testCount' | 'fee', value: number) => {
    const newPricing = [...formData.pricing]
    newPricing[index] = { ...newPricing[index], [field]: value }
    setFormData({ ...formData, pricing: newPricing })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as Omit<MockTestPackage, '_id' | 'createdAt' | 'updatedAt'>)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingPackage ? 'Edit Mock Test Package' : 'Add New Mock Test Package'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {editingPackage ? 'Update the mock test package details, features, and pricing tiers.' : 'Create a new mock test package with features and pricing details.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Package Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
            {editingPackage ? (
              <input
                type="text"
                value={formData.testType}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
            ) : (
              <select
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value as TestType })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm bg-white"
                required
              >
                <option value="">e.g., IELTS, PTE, GRE</option>
                {testTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm resize-none"
              placeholder="Package description"
            />
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Features</label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Plus className="w-3 h-3" />
                Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
                    placeholder={`Feature ${index + 1}`}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Pricing</label>
              <button
                type="button"
                onClick={handleAddPricing}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Plus className="w-3 h-3" />
                Add Tier
              </button>
            </div>
            <div className="space-y-2">
              {formData.pricing.map((tier, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${tier.testCount} Mock Test Fee`}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 1
                      handlePricingChange(index, 'testCount', num)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
                    placeholder="e.g., 1 Mock Test Fee"
                  />
                  <input
                    type="text"
                    value={tier.fee > 0 ? `BDT ${tier.fee.toLocaleString()}` : ''}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                      handlePricingChange(index, 'fee', num)
                    }}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
                    placeholder="e.g., BDT 1,550"
                  />
                  {formData.pricing.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePricing(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {editingPackage && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(editingPackage)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gray-900 rounded-lg text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              {editingPackage ? 'Save Changes' : 'Add Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
