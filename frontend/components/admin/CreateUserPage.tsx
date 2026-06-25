"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowLeft, UserPlus, Check } from "lucide-react";
import toast from "react-hot-toast";
import { getToken } from "@/lib/helpers/jwt";
import { registerUser } from "@/lib/api/auth";

type Role = "admin" | "bdm";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "bdm", label: "BDM", description: "Business Development Manager — manages leads and student pipeline" },
  { value: "admin", label: "Admin", description: "Full access — manage users, reports, and all settings" },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "bdm",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [created, setCreated] = useState<{ name: string; email: string; role: string } | null>(null);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const token = getToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({ name: form.name, email: form.email, password: form.password, role: form.role }, token);
      setCreated({ name: data.user?.name || form.name, email: data.user?.email || form.email, role: form.role });
      toast.success(`${form.role === "admin" ? "Admin" : "BDM"} account created!`);
      setForm({ name: "", email: "", password: "", confirmPassword: "", role: "bdm" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-2xl border text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition ${
      hasError ? "border-red-400 bg-red-50/30" : "border-gray-200 focus:border-blue-400/60"
    }`;

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-[#00000F]/60 hover:text-[#00000F] transition group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        {/* Success Banner */}
        <AnimatePresence>
          {created && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4"
            >
              <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={13} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">Account created successfully</p>
                <p className="text-xs text-green-700 mt-0.5">
                  <span className="font-semibold">{created.name}</span> ({created.email}) has been added as{" "}
                  <span className="font-semibold uppercase">{created.role}</span>.
                </p>
              </div>
              <button onClick={() => setCreated(null)} className="ml-auto text-green-500 hover:text-green-700 text-lg leading-none">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <div className="relative bg-white border border-blue-200/30 rounded-3xl shadow-[0_8px_80px_rgba(59,130,246,0.10),0_2px_24px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <UserPlus size={18} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#00000F] tracking-tight">Create Staff Account</h1>
                <p className="text-sm text-[#00000F]/50 mt-0.5">Add a new Admin or BDM to the system</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>

            {/* Role selector */}
            <div>
              <label className="block text-[13px] font-extrabold mb-3 text-[#00000F]/80 uppercase tracking-widest">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange("role", value)}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                      form.role === value
                        ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                  >
                    {form.role === value && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </span>
                    )}
                    <p className="text-sm font-extrabold text-[#00000F] mb-1">{label}</p>
                    <p className="text-xs text-[#00000F]/50 leading-snug">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="staff@luminedge.com"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`${inputClass(!!errors.password)} pr-11`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Confirm password"
                  className={`${inputClass(!!errors.confirmPassword)} pr-11`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                  {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 rounded-2xl font-bold text-sm text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-[0_4px_24px_rgba(59,130,246,0.35)] transition-colors"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating account…</>
                ) : (
                  <><UserPlus size={15} />Create {form.role === "admin" ? "Admin" : "BDM"} Account</>
                )}
              </span>
            </motion.button>

          </form>
        </div>
      </div>
    </div>
  );
}
