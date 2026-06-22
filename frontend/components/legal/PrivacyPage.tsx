'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, Database, Lock, Share2, Cookie, UserCheck, Mail } from 'lucide-react'
import mainlogo from '@/assets/mainlogo.png'

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, including your name, email address, role, and any lead or client data entered into the platform. We also collect usage data such as login timestamps, actions performed, and device/browser information to improve the Service.`,
  },
  {
    icon: Database,
    title: 'How We Use Your Information',
    content: `We use the information collected to: (a) provide, maintain, and improve the Service; (b) manage user accounts and authentication; (c) monitor platform activity for security purposes; (d) send important service notifications; and (e) generate analytics and reports for internal business use.`,
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: `We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), hashed password storage, and role-based access controls. Access to sensitive data is restricted to authorized personnel only. Despite our efforts, no method of electronic storage is 100% secure.`,
  },
  {
    icon: Share2,
    title: 'Data Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist us in operating the platform, subject to confidentiality agreements. We may disclose information when required by law or to protect the rights and safety of Luminedge.`,
  },
  {
    icon: Cookie,
    title: 'Cookies & Local Storage',
    content: `The platform uses cookies and browser local storage to maintain your session and remember your preferences. Authentication tokens are stored securely to keep you signed in. You may disable cookies in your browser settings, but this may affect the functionality of the Service.`,
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    content: `You have the right to access, correct, or request deletion of your personal data. You may update your profile information directly within the platform. For data deletion requests or to exercise your privacy rights, contact your system administrator or reach us at the email below.`,
  },
  {
    icon: Mail,
    title: 'Contact & Updates',
    content: `If you have questions about this Privacy Policy or how we handle your data, contact us at privacy@luminedge.com.bd. We may update this policy periodically. Significant changes will be communicated via the platform. Continued use after changes constitutes acceptance of the revised policy.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: '#FACE39', filter: 'blur(140px)', opacity: 0.07, top: '-10%', left: '-5%' }} />
        <div className="absolute w-[350px] h-[350px] rounded-full"
          style={{ background: '#FACE39', filter: 'blur(120px)', opacity: 0.05, bottom: '10%', right: '-5%' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00000F]/50 hover:text-[#FACE39] transition mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-5">
            <div className="p-3 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20">
              <Image src={mainlogo} alt="Luminedge" width={40} height={40} style={{ width: 40, height: 'auto' }} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[#00000F] tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm font-semibold text-[#00000F]/40">Last updated: March 2026 · Luminedge Bangladesh</p>
          {/* yellow accent line */}
          <div className="mt-5 h-0.5 w-16 bg-[#FACE39] rounded-full mx-auto" />
        </motion.div>

        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-[#FACE39]/8 border border-[#FACE39]/20 rounded-2xl p-5 mb-8"
        >
          <p className="text-sm font-semibold text-[#00000F]/70 leading-relaxed">
            Luminedge is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use the Luminedge CRM platform. We handle all data with care and transparency.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, i) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(250,206,57,0.1)] hover:border-[#FACE39]/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#FACE39]/10 border border-[#FACE39]/20 flex items-center justify-center group-hover:bg-[#FACE39]/20 transition">
                    <Icon className="w-4 h-4 text-[#FACE39]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#00000F] mb-2 uppercase tracking-wide">
                      {i + 1}. {section.title}
                    </h2>
                    <p className="text-sm font-medium text-[#00000F]/60 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-100 text-center"
        >
          <p className="text-xs font-semibold text-[#00000F]/30">
            © {new Date().getFullYear()} Luminedge Bangladesh. All rights reserved.{' '}
            <Link href="/terms" className="text-[#FACE39] hover:text-[#E8B010] transition">Terms of Service</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
