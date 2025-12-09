'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Code2, FileJson, Terminal, Zap, StickyNote, Home, Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from 'next-themes'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Regex Tester', href: '/regex-tester', icon: Code2 },
  { name: 'JSON Formatter', href: '/json-formatter', icon: FileJson },
  { name: 'SSH Commands', href: '/ssh-commands', icon: Terminal },
  { name: 'API Tester', href: '/api-tester', icon: Zap },
  { name: 'Notes', href: '/notes', icon: StickyNote },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Dev Helper
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Tools for Engineers</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        {!mounted ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
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
            className="w-full"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

