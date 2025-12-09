'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2, FileJson, Terminal, Zap, StickyNote } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const tools = [
  {
    title: 'Regex Tester',
    description: 'Test regular expressions with live matching and highlighting',
    icon: Code2,
    href: '/regex-tester',
    color: 'text-blue-500',
  },
  {
    title: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON with syntax highlighting',
    icon: FileJson,
    href: '/json-formatter',
    color: 'text-green-500',
  },
  {
    title: 'SSH Commands',
    description: 'Store and manage frequently used SSH commands',
    icon: Terminal,
    href: '/ssh-commands',
    color: 'text-purple-500',
  },
  {
    title: 'API Tester',
    description: 'Quick REST API testing tool',
    icon: Zap,
    href: '/api-tester',
    color: 'text-yellow-500',
  },
  {
    title: 'Task Notes',
    description: 'Lightning-fast notes with Ctrl+Space shortcut',
    icon: StickyNote,
    href: '/notes',
    color: 'text-pink-500',
  },
]

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Dev Helper</h1>
          <p className="text-muted-foreground text-lg">
            Your comprehensive suite of developer productivity tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={tool.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`${tool.color} p-3 rounded-lg bg-secondary`}>
                        <tool.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 p-6 rounded-lg bg-secondary"
        >
          <h2 className="text-2xl font-semibold mb-4">Quick Tips</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Press <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Space</kbd> anywhere to quickly add a note</li>
            <li>• All tools work offline with mock data</li>
            <li>• Toggle dark/light theme from the sidebar</li>
            <li>• Use keyboard shortcuts for faster workflow</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}

