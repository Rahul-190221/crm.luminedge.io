"use client";

import { useState } from "react";
import { submitStudentOnboarding } from "@/lib/api/studentAuth";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

interface Props {
  token: string;
  onComplete: () => void;
  onSkip?: () => void;
}

const STEPS = ["Personal", "Academic", "Financial", "Preferences"];

const COUNTRIES = ["Australia", "Canada", "UK", "USA", "New Zealand", "Germany", "Malaysia", "Other"];
const INTAKES = ["January 2025", "April 2025", "July 2025", "October 2025", "January 2026", "April 2026"];

export default function StudentOnboarding({ token, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [personal, setPersonal] = useState({
    dateOfBirth: "", gender: "", nationality: "", nativeLanguage: "",
    currentAddress: "", passportNumber: "", passportExpiry: "", emergencyContact: "",
  });

  const [academicRecords, setAcademicRecords] = useState([
    { level: "Bachelor", institution: "", board: "", result: "", year: "" },
  ]);
  const [englishTest, setEnglishTest] = useState({
    type: "IELTS", score: "", testDate: "", expiryDate: "",
  });
  const [hasEnglishTest, setHasEnglishTest] = useState(false);

  const [financial, setFinancial] = useState({
    sponsorName: "", sponsorRelation: "", fundingSource: "", estimatedBudget: "",
  });

  const [preferences, setPreferences] = useState({
    country: "", university: "", course: "", budgetRange: "", intakeYear: "", intakeSemester: "",
  });

  function addAcademicRecord() {
    setAcademicRecords([...academicRecords, { level: "HSC", institution: "", board: "", result: "", year: "" }]);
  }

  function removeAcademicRecord(i: number) {
    setAcademicRecords(academicRecords.filter((_, idx) => idx !== i));
  }

  function updateRecord(i: number, field: string, val: string) {
    const copy = [...academicRecords];
    copy[i] = { ...copy[i], [field]: val };
    setAcademicRecords(copy);
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await submitStudentOnboarding(token, {
        ...personal,
        academicRecords,
        englishTest: hasEnglishTest ? englishTest : undefined,
        financialInfo: financial,
        studyPreferences: preferences,
      });
      onComplete();
    } catch (e: any) {
      setError(e.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#00000F] focus:outline-none focus:border-[#FACE39] focus:ring-2 focus:ring-[#FACE39]/20 transition";
  const labelCls = "block text-xs font-bold text-[#00000F]/50 mb-1 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#00000F] px-8 py-6">
          <h1 className="text-lg font-black text-white">Complete Your Profile</h1>
          <p className="text-xs text-white/40 mt-0.5">Help your counselor understand your needs</p>
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col gap-1">
                <div className={`h-1 rounded-full transition-all ${i <= step ? "bg-[#FACE39]" : "bg-white/10"}`} />
                <p className={`text-[10px] font-bold ${i <= step ? "text-[#FACE39]" : "text-white/30"}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Step 0: Personal */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" className={inputCls} value={personal.dateOfBirth}
                    onChange={e => setPersonal(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={personal.gender}
                    onChange={e => setPersonal(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Nationality</label>
                  <input className={inputCls} placeholder="e.g. Bangladeshi" value={personal.nationality}
                    onChange={e => setPersonal(p => ({ ...p, nationality: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Native Language</label>
                  <input className={inputCls} placeholder="e.g. Bengali" value={personal.nativeLanguage}
                    onChange={e => setPersonal(p => ({ ...p, nativeLanguage: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Current Address</label>
                  <input className={inputCls} placeholder="Full address" value={personal.currentAddress}
                    onChange={e => setPersonal(p => ({ ...p, currentAddress: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Passport Number</label>
                  <input className={inputCls} placeholder="AB1234567" value={personal.passportNumber}
                    onChange={e => setPersonal(p => ({ ...p, passportNumber: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Passport Expiry</label>
                  <input type="date" className={inputCls} value={personal.passportExpiry}
                    onChange={e => setPersonal(p => ({ ...p, passportExpiry: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Emergency Contact</label>
                  <input className={inputCls} placeholder="Name, Phone, Relation" value={personal.emergencyContact}
                    onChange={e => setPersonal(p => ({ ...p, emergencyContact: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Academic */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide">Academic Records</p>
              {academicRecords.map((rec, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#00000F]/60">Record {i + 1}</span>
                    {academicRecords.length > 1 && (
                      <button onClick={() => removeAcademicRecord(i)} className="text-xs text-red-400 font-bold">Remove</button>
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
                      <input className={inputCls} placeholder="2022" value={rec.year}
                        onChange={e => updateRecord(i, 'year', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Institution</label>
                      <input className={inputCls} placeholder="University/College name" value={rec.institution}
                        onChange={e => updateRecord(i, 'institution', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Board/University</label>
                      <input className={inputCls} placeholder="Board name" value={rec.board}
                        onChange={e => updateRecord(i, 'board', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Result/GPA</label>
                      <input className={inputCls} placeholder="e.g. 4.5/5.0" value={rec.result}
                        onChange={e => updateRecord(i, 'result', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addAcademicRecord}
                className="text-sm font-bold text-[#b08800] border border-[#FACE39]/40 rounded-xl px-4 py-2 hover:bg-[#FACE39]/5 transition">
                + Add Record
              </button>

              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center gap-2 text-sm font-bold text-[#00000F]/70 cursor-pointer">
                  <input type="checkbox" checked={hasEnglishTest} onChange={e => setHasEnglishTest(e.target.checked)}
                    className="rounded border-gray-300 accent-[#FACE39]" />
                  I have an English proficiency test result
                </label>
                {hasEnglishTest && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className={labelCls}>Test Type</label>
                      <select className={inputCls} value={englishTest.type}
                        onChange={e => setEnglishTest(t => ({ ...t, type: e.target.value }))}>
                        {['IELTS', 'PTE', 'TOEFL', 'Duolingo'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Score</label>
                      <input className={inputCls} placeholder="e.g. 7.0" value={englishTest.score}
                        onChange={e => setEnglishTest(t => ({ ...t, score: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Test Date</label>
                      <input type="date" className={inputCls} value={englishTest.testDate}
                        onChange={e => setEnglishTest(t => ({ ...t, testDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Expiry Date</label>
                      <input type="date" className={inputCls} value={englishTest.expiryDate}
                        onChange={e => setEnglishTest(t => ({ ...t, expiryDate: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Financial */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Sponsor Name</label>
                <input className={inputCls} placeholder="Who is funding your studies?" value={financial.sponsorName}
                  onChange={e => setFinancial(f => ({ ...f, sponsorName: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Relation to Sponsor</label>
                <input className={inputCls} placeholder="Father, Self, etc." value={financial.sponsorRelation}
                  onChange={e => setFinancial(f => ({ ...f, sponsorRelation: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Funding Source</label>
                <select className={inputCls} value={financial.fundingSource}
                  onChange={e => setFinancial(f => ({ ...f, fundingSource: e.target.value }))}>
                  <option value="">Select</option>
                  <option>Family Savings</option><option>Scholarship</option>
                  <option>Bank Loan</option><option>Self-funded</option><option>Employer Sponsor</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Estimated Total Budget (AUD/USD/GBP)</label>
                <input className={inputCls} placeholder="e.g. $40,000" value={financial.estimatedBudget}
                  onChange={e => setFinancial(f => ({ ...f, estimatedBudget: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Preferred Country</label>
                <select className={inputCls} value={preferences.country}
                  onChange={e => setPreferences(p => ({ ...p, country: e.target.value }))}>
                  <option value="">Select</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Preferred Intake</label>
                <select className={inputCls} value={preferences.intakeYear}
                  onChange={e => setPreferences(p => ({ ...p, intakeYear: e.target.value }))}>
                  <option value="">Select</option>
                  {INTAKES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Target University</label>
                <input className={inputCls} placeholder="University name (if known)" value={preferences.university}
                  onChange={e => setPreferences(p => ({ ...p, university: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Target Course / Field of Study</label>
                <input className={inputCls} placeholder="e.g. MBA, Computer Science" value={preferences.course}
                  onChange={e => setPreferences(p => ({ ...p, course: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Annual Budget Range</label>
                <select className={inputCls} value={preferences.budgetRange}
                  onChange={e => setPreferences(p => ({ ...p, budgetRange: e.target.value }))}>
                  <option value="">Select</option>
                  <option>Under $20,000</option><option>$20,000 - $35,000</option>
                  <option>$35,000 - $50,000</option><option>Above $50,000</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold text-[#00000F]/60 border border-gray-200 hover:border-gray-300 transition">
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              {onSkip && (
                <button onClick={onSkip} className="px-4 py-2 rounded-xl text-sm font-medium text-[#00000F]/40 hover:text-[#00000F]/60 transition">
                  Skip for now
                </button>
              )}
            </div>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition shadow-[0_2px_12px_rgba(250,206,57,0.4)]">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition shadow-[0_2px_12px_rgba(250,206,57,0.4)] disabled:opacity-60">
                {loading ? "Saving..." : <><Check size={14} /> Complete Profile</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
