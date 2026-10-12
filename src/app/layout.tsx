import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WailNutrition',
  description: 'Suivi nutrition & entraînement — Mobile First PWA',
  manifest: '/manifest.json',
  themeColor: '#0a0a0f',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WailNutrition',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} bg-bg-primary text-text-primary min-h-screen`}>
        <main className="max-w-md mx-auto min-h-screen pb-24 relative">
          {children}
        </main>
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a27',
              color: '#f0f0f5',
              border: '1px solid #2a2a40',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#1a1a27' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1a27' },
            },
          }}
        />
      </body>
    </html>
  )
}
