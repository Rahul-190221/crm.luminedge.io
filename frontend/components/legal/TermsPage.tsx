'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Shield, Users, AlertCircle, Ban, RefreshCw, Mail } from 'lucide-react'
import mainlogo from '@/assets/mainlogo.png'

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: `By accessing or using the Luminedge CRM platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. These terms apply to all users, including administrators and Business Development Managers (BDMs).`,
  },
  {
    icon: Users,
    title: 'Use of the Service',
    content: `The Service is intended solely for authorized personnel of Luminedge. You may not share your credentials with any third party. You are responsible for all activity that occurs under your account. You agree to use the Service only for lawful purposes and in accordance with these Terms.`,
  },
  {
    icon: Shield,
    title: 'Intellectual Property',
    content: `All content, features, and functionality of the Service — including but not limited to text, graphics, logos, and software — are the exclusive property of Luminedge and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.`,
  },
  {
    icon: AlertCircle,
    title: 'Data Accuracy',
    content: `Users are responsible for the accuracy of data entered into the platform, including lead information, exam registrations, and course details. Luminedge is not liable for decisions made based on inaccurate data entered by users. You agree to maintain accurate and up-to-date information at all times.`,
  },
  {
    icon: Ban,
    title: 'Prohibited Activities',
    content: `You agree not to: (a) attempt to gain unauthorized access to any part of the Service; (b) use the Service to transmit any harmful, offensive, or illegal content; (c) reverse engineer or decompile any part of the platform; (d) use automated tools to scrape or extract data; or (e) interfere with the proper working of the Service.`,
  },
  {
    icon: RefreshCw,
    title: 'Modifications to Terms',
    content: `Luminedge reserves the right to modify these Terms at any time. We will notify users of significant changes via the platform or registered email. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.`,
  },
  {
    icon: Mail,
    title: 'Contact Us',
    content: `If you have any questions about these Terms of Service, please contact us at legal@luminedge.com.bd or visit our office at Luminedge Bangladesh, Dhaka. We aim to respond to all inquiries within 2 business days.`,
  },
]

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: '#FACE39', filter: 'blur(140px)', opacity: 0.07, top: '-10%', right: '-5%' }} />
        <div className="absolute w-[350px] h-[350px] rounded-full"
          style={{ background: '#FACE39', filter: 'blur(120px)', opacity: 0.05, bottom: '10%', left: '-5%' }} />
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
          <h1 className="text-3xl font-extrabold text-[#00000F] tracking-tight mb-2">Terms of Service</h1>
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
            These Terms of Service govern your use of the Luminedge CRM platform. Please read them carefully before using the Service. By using the platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.
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
            <Link href="/privacy" className="text-[#FACE39] hover:text-[#E8B010] transition">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
