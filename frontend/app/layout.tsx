import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { SocketProvider } from '@/components/providers/SocketProvider'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Luminedge CRM',
  description: 'Premium CRM for exam venue management',
  icons: {
    icon: { url: '/assets/favicon-25.png', sizes: '25x25', type: 'image/png' },
    shortcut: { url: '/assets/favicon-25.png', sizes: '25x25', type: 'image/png' },
    apple: '/assets/mainlogo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-body bg-white text-[#00000F] antialiased" suppressHydrationWarning>
        {/* Ambient animated lighting background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="ambient-blob-1 absolute rounded-full blob-1" />
          <div className="ambient-blob-2 absolute rounded-full blob-2" />
          <div className="ambient-blob-3 absolute rounded-full blob-3" />
          <div className="ambient-blob-4 absolute rounded-full blob-4" />
        </div>

        <div className="relative z-10">
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <SocketProvider>
              <NotificationProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: '#fff',
                      color: '#00000F',
                      border: '1px solid rgba(250,206,57,0.3)',
                      boxShadow: '0 4px 20px rgba(250,206,57,0.15)',
                      fontFamily: 'var(--font-body)',
                    },
                  }}
                />
                {children}
              </NotificationProvider>
            </SocketProvider>
          </GoogleOAuthProvider>
        </div>
      </body>
    </html>
  )
}
