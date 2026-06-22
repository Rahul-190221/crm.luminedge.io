"use client";

import { useEffect, useState } from "react";
import { getNews } from "@/lib/api/news";
import type { NewsItem, NewsCategory } from "@/types/student";
import { Pin, Newspaper } from "lucide-react";

interface Props { token: string; profile: any; onRefresh: () => void; }

const CATEGORIES: NewsCategory[] = ["General", "IELTS", "Study Abroad", "Visa", "Event", "Scholarship"];

const categoryColors: Record<NewsCategory, string> = {
  General: "text-gray-600 bg-gray-100",
  IELTS: "text-blue-600 bg-blue-50",
  "Study Abroad": "text-green-600 bg-green-50",
  Visa: "text-purple-600 bg-purple-50",
  Event: "text-yellow-600 bg-yellow-50",
  Scholarship: "text-pink-600 bg-pink-50",
};

export default function StudentNews({ token }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<NewsCategory | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNews(filter || undefined).then(d => setNews(d.news || [])).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Newspaper size={16} className="text-[#b08800]" />
        <h3 className="text-sm font-black text-[#00000F]">News & Updates</h3>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
            filter === "" ? "bg-[#FACE39] border-[#FACE39] text-[#00000F]" : "border-gray-200 text-[#00000F]/60 hover:border-gray-300"
          }`}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
              filter === c ? "bg-[#FACE39] border-[#FACE39] text-[#00000F]" : "border-gray-200 text-[#00000F]/60 hover:border-gray-300"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#FACE39] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-[#00000F]/40">
          <p className="text-sm font-bold">No news available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map(n => (
            <div key={n._id} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {n.isPinned && <Pin size={12} className="text-[#b08800] flex-shrink-0" />}
                  <h4 className="text-sm font-black text-[#00000F]">{n.title}</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[n.category]}`}>
                  {n.category}
                </span>
              </div>
              <p className="text-xs text-[#00000F]/60 leading-relaxed">{n.content}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-[#00000F]/30">{n.createdBy?.name}</p>
                <p className="text-[10px] text-[#00000F]/30">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
