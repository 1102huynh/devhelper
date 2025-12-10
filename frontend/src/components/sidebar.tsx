'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Code2, FileJson, Terminal, Zap, StickyNote, Home, Moon, Sun, Binary, Link2, Hash, KeyRound, Clock, Fingerprint, FileCode, Calendar, GitCompare, Type, Palette, Code, FileText, QrCode, Info, Sparkles, Database, Target, FileCheck, Globe, Server, Menu, ChevronLeft } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="border-r bg-card/50 backdrop-blur-xl flex flex-col h-screen overflow-hidden relative"
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 -right-4 z-50 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </Button>

      {/* Header with gradient */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
            {isOpen && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-bold gradient-text whitespace-nowrap"
              >
                Dev Helper
              </motion.h1>
            )}
          </div>
          {isOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground"
            >
              25 Professional Tools
            </motion.p>
          )}
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
                title={!isOpen ? item.name : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                  isOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center',
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
                  'w-5 h-5 transition-transform duration-200 group-hover:scale-110 relative z-10 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : item.color
                )} />
                {isOpen && (
                  <span className="relative z-10 whitespace-nowrap">{item.name}</span>
                )}

                {/* Active indicator */}
                {isActive && isOpen && (
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
          className="flex flex-col items-center"
        >
          {/* GitHub Star Button - Only show when open */}
          {mounted && isOpen && (
            <GitHubStarButton
              repoUrl="https://github.com/1102huynh/devhelper"
              text="Star on GitHub"
              variant="outline"
            />
          )}

          {/* GitHub Icon Button - Only show when collapsed */}
          {mounted && !isOpen && (
            <Button
              variant="outline"
              size="icon"
              className="group hover:shadow-lg transition-all duration-300"
              asChild
            >
              <a
                href="https://github.com/1102huynh/devhelper"
                target="_blank"
                rel="noopener noreferrer"
                title="Star on GitHub"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-500" />
              </a>
            </Button>
          )}

          {/* Theme Toggle */}
          {!mounted ? (
            <Button
              variant="outline"
              size={isOpen ? "sm" : "icon"}
              className={isOpen ? "w-full mt-2" : "mt-2"}
              disabled
            >
              <Sun className="w-4 h-4" />
              {isOpen && <span className="ml-2">Theme</span>}
            </Button>
          ) : (
            <Button
              variant="outline"
              size={isOpen ? "sm" : "icon"}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "group hover:shadow-lg transition-all duration-300 mt-2",
                isOpen && "w-full"
              )}
              title={!isOpen ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className={cn(
                    "w-4 h-4 group-hover:rotate-180 transition-transform duration-500",
                    isOpen && "mr-2"
                  )} />
                  {isOpen && "Light Mode"}
                </>
              ) : (
                <>
                  <Moon className={cn(
                    "w-4 h-4 group-hover:-rotate-12 transition-transform duration-500",
                    isOpen && "mr-2"
                  )} />
                  {isOpen && "Dark Mode"}
                </>
              )}
            </Button>
          )}

          {/* Version badge - Only show when open */}
          {isOpen && (
            <div className="mt-3 text-center">
              <span className="text-xs text-muted-foreground">v2.0.0</span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

