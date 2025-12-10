import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from '@/components/sidebar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Dev Helper - 20 Professional Developer Tools',
  description: 'Comprehensive suite of professional developer productivity tools including Regex Tester, JSON Formatter, UUID Generator, and more.',
  keywords: ['developer tools', 'regex tester', 'json formatter', 'uuid generator', 'productivity'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Gradient orbs for visual interest */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {children}
              </div>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'rounded-xl',
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

