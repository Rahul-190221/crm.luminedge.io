"use client";

import { useState } from "react";
import { submitStudentOnboarding } from "@/lib/api/studentAuth";
import type { StudentProfile, AcademicRecord, EnglishTest } from "@/types/student";
import { Save, Plus, Trash2 } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-[#FACE39] focus:ring-2 focus:ring-[#FACE39]/20 transition";
const labelCls = "block text-xs font-bold text-[#00000F]/50 mb-1 uppercase tracking-wide";

export default function StudentAcademic({ token, profile, onRefresh }: Props) {
  const [records, setRecords] = useState<AcademicRecord[]>(
    profile.academicRecords?.length ? profile.academicRecords : [{ level: "Bachelor", institution: "", board: "", result: "", year: undefined }]
  );
  const [test, setTest] = useState<Partial<EnglishTest>>(profile.englishTest || { type: "IELTS" });
  const [hasTest, setHasTest] = useState(!!profile.englishTest);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function addRecord() {
    setRecords(r => [...r, { level: "HSC", institution: "", board: "", result: "", year: undefined }]);
  }

  function updateRecord(i: number, field: string, val: any) {
    setRecords(r => r.map((rec, idx) => idx === i ? { ...rec, [field]: val } : rec));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await submitStudentOnboarding(token, {
        academicRecords: records,
        englishTest: hasTest ? test : undefined,
      });
      setMsg("Academic information saved.");
      onRefresh();
    } catch (e: any) {
      setMsg(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-[#00000F]">Academic Records</h3>
          <button onClick={addRecord} className="flex items-center gap-1 text-xs font-bold text-[#b08800] border border-[#FACE39]/40 px-3 py-1.5 rounded-lg hover:bg-[#FACE39]/5 transition">
            <Plus size={12} /> Add
          </button>
        </div>

        <div className="space-y-4">
          {records.map((rec, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold text-[#00000F]/50">Record {i + 1}</span>
                {records.length > 1 && (
                  <button onClick={() => setRecords(r => r.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600 transition">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Level</label>
                  <select className={inputCls} value={rec.level} onChange={e => updateRecord(i, 'level', e.target.value)}>
                    {['SSC', 'HSC', 'Diploma', 'Bachelor', 'Master'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Year</label>
                  <input type="number" className={inputCls} value={rec.year || ""}
                    onChange={e => updateRecord(i, 'year', Number(e.target.value))} placeholder="2022" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Institution</label>
                  <input className={inputCls} value={rec.institution}
                    onChange={e => updateRecord(i, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Board</label>
                  <input className={inputCls} value={rec.board || ""}
                    onChange={e => updateRecord(i, 'board', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Result/GPA</label>
                  <input className={inputCls} value={rec.result || ""}
                    onChange={e => updateRecord(i, 'result', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <input type="checkbox" id="hasTest" checked={hasTest} onChange={e => setHasTest(e.target.checked)}
            className="rounded border-gray-300 accent-[#FACE39]" />
          <label htmlFor="hasTest" className="text-sm font-bold text-[#00000F] cursor-pointer">
            I have an English proficiency test result
          </label>
        </div>
        {hasTest && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Test Type</label>
              <select className={inputCls} value={test.type || "IELTS"}
                onChange={e => setTest(t => ({ ...t, type: e.target.value as any }))}>
                {['IELTS', 'PTE', 'TOEFL', 'Duolingo'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Overall Score</label>
              <input className={inputCls} value={test.score || ""}
                onChange={e => setTest(t => ({ ...t, score: e.target.value }))} placeholder="e.g. 7.0" />
            </div>
            <div>
              <label className={labelCls}>Test Date</label>
              <input type="date" className={inputCls} value={test.testDate || ""}
                onChange={e => setTest(t => ({ ...t, testDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Expiry Date</label>
              <input type="date" className={inputCls} value={test.expiryDate || ""}
                onChange={e => setTest(t => ({ ...t, expiryDate: e.target.value }))} />
            </div>
          </div>
        )}
      </div>

      {msg && <p className="text-xs font-medium text-green-600">{msg}</p>}
      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition disabled:opacity-60">
        <Save size={14} />
        {saving ? "Saving..." : "Save Academic Info"}
      </button>
    </div>
  );
}
