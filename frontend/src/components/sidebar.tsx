'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Code2, FileJson, Terminal, Zap, StickyNote, Home, Moon, Sun, Binary, Link2, Hash, KeyRound, Clock, Fingerprint, FileCode, Calendar, GitCompare, Type, Palette, Code, FileText, QrCode, Info, Sparkles, Database, Target, FileCheck, Globe, Server } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import GitHubStarButton from './github-star-button'

const navigation = [
  { name: 'Home', href: '/', icon: Home, color: 'text-blue-500' },
  { name: 'Regex Tester', href: '/regex-tester', icon: Code2, color: 'text-blue-500' },
  { name: 'JSON Formatter', href: '/json-formatter', icon: FileJson, color: 'text-green-500' },
  { name: 'XML Formatter', href: '/xml-formatter', icon: FileCode, color: 'text-amber-500' },
  { name: 'Base64', href: '/base64', icon: Binary, color: 'text-orange-500' },
  { name: 'URL Encoder', href: '/url-encoder', icon: Link2, color: 'text-cyan-500' },
  { name: 'HTML Encoder', href: '/html-encoder', icon: Code, color: 'text-lime-500' },
  { name: 'Hash Generator', href: '/hash-generator', icon: Hash, color: 'text-indigo-500' },
  { name: 'JWT Decoder', href: '/jwt-decoder', icon: KeyRound, color: 'text-emerald-500' },
  { name: 'UUID Generator', href: '/uuid-generator', icon: Fingerprint, color: 'text-violet-500' },
  { name: 'Timestamp', href: '/timestamp', icon: Clock, color: 'text-teal-500' },
  { name: 'Cron Parser', href: '/cron-parser', icon: Calendar, color: 'text-rose-500' },
  { name: 'Diff Checker', href: '/diff-checker', icon: GitCompare, color: 'text-slate-500' },
  { name: 'Text Utils', href: '/text-utils', icon: Type, color: 'text-fuchsia-500' },
  { name: 'Color Converter', href: '/color-converter', icon: Palette, color: 'text-red-500' },
  { name: 'Lorem Ipsum', href: '/lorem-ipsum', icon: FileText, color: 'text-sky-500' },
  { name: 'QR Generator', href: '/qr-generator', icon: QrCode, color: 'text-neutral-500' },
  { name: 'HTTP Status', href: '/http-status', icon: Info, color: 'text-blue-600' },
  { name: 'SSH Commands', href: '/ssh-commands', icon: Terminal, color: 'text-purple-500' },
  { name: 'API Tester', href: '/api-tester', icon: Zap, color: 'text-yellow-500' },
  { name: 'Notes', href: '/notes', icon: StickyNote, color: 'text-pink-500' },
  // Automation Testing Tools
  { name: 'Test Data Generator', href: '/test-data-generator', icon: Database, color: 'text-purple-600' },
  { name: 'Selector Tester', href: '/selector-tester', icon: Target, color: 'text-cyan-600' },
  { name: 'JSON Schema Validator', href: '/json-schema-validator', icon: FileCheck, color: 'text-emerald-600' },
  { name: 'HTTP Headers Analyzer', href: '/http-headers-analyzer', icon: Globe, color: 'text-orange-600' },
  { name: 'Mock API Generator', href: '/mock-api-generator', icon: Server, color: 'text-indigo-600' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-64 border-r bg-card/50 backdrop-blur-xl flex flex-col h-screen overflow-hidden">
      {/* Header with gradient */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold gradient-text">
              Dev Helper
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">25 Professional Tools</p>
        </motion.div>
      </div>

      {/* Navigation with custom scrollbar */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                {/* Gradient overlay on hover */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <item.icon className={cn(
                  'w-5 h-5 transition-transform duration-200 group-hover:scale-110 relative z-10',
                  isActive ? 'text-primary-foreground' : item.color
                )} />
                <span className="relative z-10">{item.name}</span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer with theme toggle */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-br from-secondary/30 to-transparent space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* GitHub Star Button */}
          {mounted && (
            <GitHubStarButton
              repoUrl="https://github.com/1102huynh/devhelper"
              text="Star on GitHub"
              variant="outline"
            />
          )}

          {/* Theme Toggle */}
          {!mounted ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              disabled
            >
              <Sun className="w-4 h-4 mr-2" />
              Theme
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full group hover:shadow-lg transition-all duration-300 mt-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2 group-hover:-rotate-12 transition-transform duration-500" />
                  Dark Mode
                </>
              )}
            </Button>
          )}

          {/* Version badge */}
          <div className="mt-3 text-center">
            <span className="text-xs text-muted-foreground">v2.0.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

