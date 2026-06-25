'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { getNews, createNews, updateNews, deleteNews } from '@/lib/api/news'
import type { NewsItem, NewsCategory } from '@/types/student'
import { Pin, Plus, Pencil, Trash2 } from 'lucide-react'

const CATEGORIES: NewsCategory[] = ['General', 'IELTS', 'Study Abroad', 'Visa', 'Event', 'Scholarship']

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<NewsItem | null>(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'General' as NewsCategory, isPinned: false })
  const [saving, setSaving] = useState(false)

  const token = Cookies.get('accessToken') || localStorage.getItem('accessToken') || ''

  async function load() {
    const data = await getNews()
    setNews(data.news || [])
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    try {
      if (editItem) {
        await updateNews(token, editItem._id, form)
      } else {
        await createNews(token, form)
      }
      setShowForm(false)
      setEditItem(null)
      setForm({ title: '', content: '', category: 'General', isPinned: false })
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Archive this post?')) return
    await deleteNews(token, id)
    load()
  }

  async function togglePin(item: NewsItem) {
    await updateNews(token, item._id, { isPinned: !item.isPinned })
    load()
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#00000F]">News Management</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ title: '', content: '', category: 'General', isPinned: false }) }}
          className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 px-3 py-2 rounded-xl hover:bg-blue-700 transition">
          <Plus size={12} /> Create Post
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-blue-200/50 bg-white p-6 space-y-4">
          <h3 className="text-sm font-black text-[#00000F]">{editItem ? 'Edit Post' : 'New Post'}</h3>
          <div>
            <label className="block text-xs font-bold text-[#00000F]/50 mb-1 uppercase">Title</label>
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#00000F]/50 mb-1 uppercase">Content</label>
            <textarea className={`${inputCls} resize-none`} rows={4} value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#00000F]/50 mb-1 uppercase">Category</label>
              <select className={inputCls} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as NewsCategory }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 text-sm font-bold text-[#00000F]/60 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                  className="accent-blue-600" />
                Pin this post
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.title || !form.content}
              className="px-4 py-2 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Post'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#00000F]/50 border border-gray-200 hover:border-gray-300 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {news.map(n => (
          <div key={n._id} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {n.isPinned && <Pin size={11} className="text-blue-600 flex-shrink-0" />}
                  <h4 className="text-sm font-bold text-[#00000F] truncate">{n.title}</h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-[#00000F]/50 mt-0.5 line-clamp-1">{n.content}</p>
              </div>
              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                <button onClick={() => togglePin(n)} title="Toggle pin"
                  className={`p-1.5 rounded-lg transition ${n.isPinned ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <Pin size={12} />
                </button>
                <button onClick={() => { setEditItem(n); setForm({ title: n.title, content: n.content, category: n.category, isPinned: n.isPinned }); setShowForm(true) }}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDelete(n._id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
