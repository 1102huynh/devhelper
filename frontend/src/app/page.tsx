'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2, FileJson, Terminal, Zap, StickyNote, Binary, Link2, Hash, KeyRound, Clock, Fingerprint, FileCode, Calendar, GitCompare, Type, Palette, Code, FileText, QrCode, Info, Sparkles, Rocket, Star } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

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
    title: 'XML Formatter',
    description: 'Format, validate, and beautify XML documents',
    icon: FileCode,
    href: '/xml-formatter',
    color: 'text-amber-500',
  },
  {
    title: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings',
    icon: Binary,
    href: '/base64',
    color: 'text-orange-500',
  },
  {
    title: 'URL Encoder',
    description: 'Encode and decode URLs and query parameters',
    icon: Link2,
    href: '/url-encoder',
    color: 'text-cyan-500',
  },
  {
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    icon: Hash,
    href: '/hash-generator',
    color: 'text-indigo-500',
  },
  {
    title: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens',
    icon: KeyRound,
    href: '/jwt-decoder',
    color: 'text-emerald-500',
  },
  {
    title: 'UUID Generator',
    description: 'Generate random UUIDs (v4)',
    icon: Fingerprint,
    href: '/uuid-generator',
    color: 'text-violet-500',
  },
  {
    title: 'Timestamp Converter',
    description: 'Convert Unix timestamps to readable dates',
    icon: Clock,
    href: '/timestamp',
    color: 'text-teal-500',
  },
  {
    title: 'Cron Parser',
    description: 'Parse and understand cron expressions',
    icon: Calendar,
    href: '/cron-parser',
    color: 'text-rose-500',
  },
  {
    title: 'Diff Checker',
    description: 'Compare two text blocks and highlight differences',
    icon: GitCompare,
    href: '/diff-checker',
    color: 'text-slate-500',
  },
  {
    title: 'Text Utilities',
    description: 'Transform and manipulate text with various operations',
    icon: Type,
    href: '/text-utils',
    color: 'text-fuchsia-500',
  },
  {
    title: 'Color Converter',
    description: 'Convert between HEX, RGB, and HSL color formats',
    icon: Palette,
    href: '/color-converter',
    color: 'text-red-500',
  },
  {
    title: 'HTML Encoder',
    description: 'Encode and decode HTML entities',
    icon: Code,
    href: '/html-encoder',
    color: 'text-lime-500',
  },
  {
    title: 'Lorem Ipsum',
    description: 'Generate placeholder text for your designs',
    icon: FileText,
    href: '/lorem-ipsum',
    color: 'text-sky-500',
  },
  {
    title: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, and more',
    icon: QrCode,
    href: '/qr-generator',
    color: 'text-neutral-500',
  },
  {
    title: 'HTTP Status Codes',
    description: 'Quick reference guide for HTTP status codes',
    icon: Info,
    href: '/http-status',
    color: 'text-blue-600',
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 border-b border-border/50">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">20 Professional Tools</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="gradient-text">Dev Helper</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your comprehensive suite of professional developer productivity tools.
              Built for engineers who demand excellence.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl">
                <Star className="w-5 h-5 mr-2" />
                Star on GitHub
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">20</div>
                <div className="text-sm text-muted-foreground">Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-1">25+</div>
                <div className="text-sm text-muted-foreground">APIs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500 mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Free</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            All Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
              >
                <Link href={tool.href}>
                  <Card className="modern-card group cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`${tool.color} p-3 rounded-xl bg-secondary/50 group-hover:bg-secondary transition-colors`}
                        >
                          <tool.icon className="w-6 h-6" />
                        </motion.div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {tool.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 border-y border-border/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Why Dev Helper?</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Lightning Fast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All tools are optimized for speed. No waiting, no lag. Just instant results.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Beautiful Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Modern, clean interface with dark mode support. Professional and pleasing to use.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-500" />
                    Developer First
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Built by developers, for developers. Every tool is designed with your workflow in mind.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-pink-500" />
                    Always Free
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All 20 tools are completely free. No subscriptions, no limits, no catches.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="modern-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-2xl">⚡ Quick Tips</CardTitle>
              <CardDescription>Master Dev Helper in seconds</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>
                    Press <kbd>Ctrl+Space</kbd> anywhere to quickly add a note
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 font-semibold">•</span>
                  <span>All tools work offline with mock data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 font-semibold">•</span>
                  <span>Toggle dark/light theme from the sidebar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-semibold">•</span>
                  <span>One-click copy functionality on all outputs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}

